import emailjs from '@emailjs/browser';

// ============================================
// CONFIGURACIÓN CON CONTRASEÑA DE APLICACIÓN
// ============================================

// INSTRUCCIONES PARA CONFIGURAR SMTP EN EMAILJS:
//
// 1. En EmailJS, ve a "Email Services"
// 2. Crea un NUEVO servicio (no uses el de Gmail que dio error)
// 3. Selecciona tipo: "SMTP"
// 4. Completa estos datos:
//    - Name: Gmail SMTP
//    - SMTP Host: smtp.gmail.com
//    - Port: 587
//    - Username: cristoferagurto2@gmail.com
//    - Password: [Pega aquí tu contraseña de 16 caracteres]
//    - Encryption: TLS
//    - From Email: cristoferagurto2@gmail.com
//    - From Name: ClientCore
//
// 5. Presiona "Create Service"
// 6. Copia el Service ID (ejemplo: service_abc123)
// 7. Pégalo aquí abajo en SERVICE_ID
//
// 8. Ve a "Email Templates" y crea una plantilla
// 9. Copia el Template ID (ejemplo: template_xyz789)
// 10. Pégalo aquí abajo en TEMPLATE_ID
//
// 11. Ve a Account > General, copia Public Key
// 12. Pégalo aquí abajo en PUBLIC_KEY

const SERVICE_ID = 'service_tu_service_id';   // ← Pega aquí tu Service ID
const TEMPLATE_ID = 'template_tu_template_id'; // ← Pega aquí tu Template ID
const PUBLIC_KEY = 'tu_public_key';           // ← Pega aquí tu Public Key

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
