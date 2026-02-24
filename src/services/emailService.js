// ============================================
// SERVICIO DE EMAIL - CONECTA CON BACKEND
// ============================================

const API_URL = 'https://clientcore-backend.onrender.com';

// Función para hacer fetch con timeout
const fetchWithTimeout = async (url, options, timeout = 60000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const sendPaymentNotification = async (planName, planPrice, clientEmail, file) => {
  try {
    const formData = new FormData();
    formData.append('planName', planName);
    formData.append('planPrice', planPrice);
    formData.append('clientEmail', clientEmail);
    formData.append('comprobante', file);

    // Timeout de 60 segundos para dar tiempo al backend de despertar
    const response = await fetchWithTimeout(
      `${API_URL}/api/send-payment`,
      {
        method: 'POST',
        body: formData,
      },
      60000 // 60 segundos de timeout
    );

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.error || 'Error al enviar' };
    }

  } catch (error) {
    console.error('Error enviando al backend:', error);
    if (error.name === 'AbortError') {
      return { 
        success: false, 
        error: 'El servidor está despertando. Espera 30-60 segundos e intenta nuevamente.' 
      };
    }
    return { 
      success: false, 
      error: 'No se pudo conectar con el servidor. Intenta nuevamente.' 
    };
  }
};

export const checkBackendHealth = async () => {
  try {
    const response = await fetchWithTimeout(
      `${API_URL}/api/health`,
      {},
      10000 // 10 segundos para health check
    );
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Backend no disponible' };
  }
};
