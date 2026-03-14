import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://clientcode.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // No redirigimos automáticamente para mantener compatibilidad con localStorage
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  // Verificar si el backend está disponible
  healthCheck: async () => {
    try {
      const response = await api.get('/health', { timeout: 5000 });
      return { available: true, data: response.data };
    } catch (error) {
      return { available: false, error: error.message };
    }
  },

  // Login
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Sincronizar con localStorage legacy
        localStorage.setItem('user_backend', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Registro
  register: async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Obtener perfil del usuario
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Actualizar perfil
  updateProfile: async (data) => {
    try {
      const response = await api.put('/auth/profile', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Cambiar contraseña
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// ==================== DOCUMENTS API ====================
export const documentsAPI = {
  // Obtener documento de un mes
  getDocument: async (month) => {
    try {
      const response = await api.get(`/documents/${month}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Guardar documento completo
  saveDocument: async (month, data, targetClientId = null) => {
    try {
      const payload = { ...data };
      if (targetClientId) {
        payload.targetClientId = targetClientId;
      }
      const response = await api.post(`/documents/${month}`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Actualizar una celda específica
  updateCell: async (month, rowIndex, colIndex, value) => {
    try {
      const response = await api.put(`/documents/${month}/cell`, {
        rowIndex,
        colIndex,
        value,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Actualizar múltiples celdas
  bulkUpdate: async (month, edits) => {
    try {
      const response = await api.post(`/documents/${month}/bulk-update`, {
        edits,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Eliminar documento
  deleteDocument: async (month) => {
    try {
      const response = await api.delete(`/documents/${month}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Exportar documento
  exportDocument: async (month) => {
    try {
      const response = await api.get(`/documents/${month}/export`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },
};

// ==================== SYNC SERVICE ====================
export const syncService = {
  // Verificar si el backend está disponible
  isBackendAvailable: async () => {
    const result = await authAPI.healthCheck();
    return result.available;
  },

  // Sincronizar documento desde localStorage al backend
  syncDocumentToBackend: async (clientId, month) => {
    try {
      const localDocs = JSON.parse(localStorage.getItem('clientDocuments') || '{}');
      const localCompleted = JSON.parse(localStorage.getItem('completedData') || '{}');
      
      const doc = localDocs[clientId]?.[month];
      const completed = localCompleted[`${clientId}-${month}`];
      
      if (!doc) return { success: false, error: 'No hay datos locales' };
      
      // Preparar datos para el backend
      const backendData = {
        headers: doc.headers,
        data: doc.data,
      };
      
      // Guardar en backend
      await documentsAPI.saveDocument(month, backendData);
      
      // Si hay completedData, sincronizar celda por celda
      if (completed && Object.keys(completed).length > 0) {
        const edits = Object.entries(completed).map(([key, value]) => {
          const [rowIndex, colIndex] = key.split('-').map(Number);
          return { rowIndex, colIndex, value };
        });
        
        if (edits.length > 0) {
          await documentsAPI.bulkUpdate(month, edits);
        }
      }
      
      return { success: true, message: 'Documento sincronizado' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Sincronizar documento desde backend a localStorage
  syncDocumentFromBackend: async (clientId, month) => {
    try {
      const response = await documentsAPI.getDocument(month);
      
      if (!response.success) return response;
      
      const backendDoc = response.document;
      
      // Guardar en localStorage
      const localDocs = JSON.parse(localStorage.getItem('clientDocuments') || '{}');
      const localCompleted = JSON.parse(localStorage.getItem('completedData') || '{}');
      
      if (!localDocs[clientId]) {
        localDocs[clientId] = {};
      }
      
      // Convertir completedData del backend al formato local
      const completedData = {};
      if (backendDoc.completedData && Array.isArray(backendDoc.completedData)) {
        backendDoc.completedData.forEach(edit => {
          completedData[`${edit.rowIndex}-${edit.colIndex}`] = edit.value;
        });
      }
      
      localDocs[clientId][month] = {
        name: `Documento_${month}_2026.xlsx`,
        headers: backendDoc.headers,
        data: backendDoc.data,
        uploadedAt: backendDoc.lastModified,
        clientId: clientId,
        sheets: {
          [month]: [backendDoc.headers, ...backendDoc.data],
        },
        sheetNames: [month],
      };
      
      localCompleted[`${clientId}-${month}`] = completedData;
      
      localStorage.setItem('clientDocuments', JSON.stringify(localDocs));
      localStorage.setItem('completedData', JSON.stringify(localCompleted));
      
      return { success: true, message: 'Documento descargado del backend' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// ==================== ADMIN API ====================
export const adminAPI = {
  // Subir documento para un cliente (admin)
  uploadDocumentForClient: async (clientId, month, data) => {
    try {
      const response = await api.post(`/admin/clients/${clientId}/documents/${month}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }ve 
  },

  // Obtener documentos de un cliente
  getClientDocuments: async (clientId) => {
    try {
      const response = await api.get(`/admin/clients/${clientId}/documents`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Eliminar documento de un cliente
  deleteClientDocument: async (clientId, month, year) => {
    try {
      const response = await api.delete(`/admin/clients/${clientId}/documents/${month}?year=${year || 2026}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Obtener todos los clientes
  getAllClients: async () => {
    try {
      const response = await api.get('/admin/clients');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Suscribir/desuscribir cliente
  updateClientSubscription: async (clientId, isSubscribed) => {
    try {
      const response = await api.put(`/admin/clients/${clientId}/subscribe`, { isSubscribed });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Marcar/desmarcar cliente como VIP
  toggleVipStatus: async (clientId, isVip) => {
    try {
      const response = await api.put(`/admin/clients/${clientId}/vip`, { isVip });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // ==================== PLANTILLAS (TEMPLATES) ====================
  
  // Obtener todas las plantillas
  getTemplates: async () => {
    try {
      const response = await api.get('/admin/templates');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Obtener plantilla oficial
  getOfficialTemplate: async () => {
    try {
      const response = await api.get('/admin/templates/official');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Crear nueva plantilla
  createTemplate: async (templateData) => {
    try {
      const response = await api.post('/admin/templates', templateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Actualizar plantilla
  updateTemplate: async (templateId, templateData) => {
    try {
      const response = await api.put(`/admin/templates/${templateId}`, templateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Establecer plantilla como oficial
  setTemplateAsOfficial: async (templateId) => {
    try {
      const response = await api.put(`/admin/templates/${templateId}/official`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Eliminar plantilla
  deleteTemplate: async (templateId) => {
    try {
      const response = await api.delete(`/admin/templates/${templateId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Aplicar plantilla oficial a un cliente específico
  applyTemplateToClient: async (clientId, year = 2026) => {
    try {
      const response = await api.post(`/admin/apply-template/${clientId}`, { year });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Aplicar plantilla oficial a TODOS los clientes
  applyTemplateToAllClients: async (year = 2026) => {
    try {
      const response = await api.post('/admin/apply-template-all', { year });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Subir archivo Excel como plantilla oficial
  uploadTemplateFile: async (file, name = '', description = '') => {
    try {
      const formData = new FormData();
      formData.append('templateFile', file);
      if (name) formData.append('name', name);
      if (description) formData.append('description', description);

      const response = await api.post('/admin/templates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // ==================== CONFIGURACIÓN SIMPLE DE DOCUMENTO ====================
  
  // Obtener configuración del documento oficial
  getDocumentConfig: async () => {
    try {
      const response = await api.get('/admin/document-config');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Actualizar configuración del documento oficial
  updateDocumentConfig: async (headers) => {
    try {
      const response = await api.put('/admin/document-config', { headers });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },

  // Aplicar configuración a todos los clientes
  applyDocumentConfig: async (year = 2026) => {
    try {
      const response = await api.post('/admin/apply-document-config', { year });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: error.message };
    }
  },
};

export default api;
