// ============================================
// SERVICIO DE EMAIL - CONECTA CON BACKEND
// ============================================
// Este archivo envía los comprobantes al backend
// El backend se encarga de enviar el email con Nodemailer
// ============================================

// URL del backend (cambia esto cuando despliegues en Render.com)
// Desarrollo local: http://localhost:3001
// Producción (Render.com): https://tu-backend.onrender.com
const API_URL = 'https://clientcore-backend.onrender.com';

export const sendPaymentNotification = async (planName, planPrice, clientEmail, file) => {
  try {
    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('planName', planName);
    formData.append('planPrice', planPrice);
    formData.append('clientEmail', clientEmail);
    formData.append('comprobante', file);

    // Enviar al backend
    const response = await fetch(`${API_URL}/api/send-payment`, {
      method: 'POST',
      body: formData,
      // No necesitas Content-Type, fetch lo pone automático con FormData
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.error || 'Error al enviar' };
    }

  } catch (error) {
    console.error('Error enviando al backend:', error);
    return { success: false, error: 'Error de conexión con el servidor' };
  }
};

// Función para verificar que el backend está funcionando
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Backend no disponible' };
  }
};
