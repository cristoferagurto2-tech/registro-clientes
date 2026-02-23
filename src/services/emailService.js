import emailjs from '@emailjs/browser';

// Configuración de EmailJS
const SERVICE_ID = 'service_clientcore'; // Lo obtendrás de EmailJS
const TEMPLATE_ID = 'template_payment'; // Lo obtendrás de EmailJS
const PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Lo obtendrás de EmailJS

export const sendPaymentNotification = async (planName, planPrice, clientEmail, file) => {
  try {
    // Convertir archivo a base64 para adjuntarlo
    const base64File = await fileToBase64(file);
    
    const templateParams = {
      to_email: 'cristoferagurto2@gmail.com',
      from_email: clientEmail,
      plan_name: planName,
      plan_price: planPrice,
      message: `Nuevo pago recibido del ${planName} (S/ ${planPrice}.00)`,
      attachment: base64File,
      attachment_name: file.name
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    return { success: true, message: 'Email enviado correctamente' };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error: error.message };
  }
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
