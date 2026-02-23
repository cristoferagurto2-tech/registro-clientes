# Configuración de EmailJS para ClientCore

## Pasos para configurar el envío de correos a cristoferagurto2@gmail.com

### 1. Crear cuenta en EmailJS
1. Ve a https://www.emailjs.com/
2. Clic en "Get Started Free"
3. Regístrate con tu correo: cristoferagurto2@gmail.com
4. Verifica tu email

### 2. Configurar Servicio de Email (Gmail)
1. En el panel de EmailJS, ve a "Email Services"
2. Clic en "Add New Service"
3. Selecciona "Gmail"
4. Clic en "Connect Account"
5. Inicia sesión con: cristoferagurto2@gmail.com
6. Autoriza a EmailJS
7. Guarda el **Service ID** (ej: service_abc123)

### 3. Crear Plantilla de Email
1. Ve a "Email Templates"
2. Clic en "Create New Template"
3. Configura:
   - **Template Name:** Notificación de Pago
   - **Subject:** Nuevo Pago Recibido - {{plan_name}}
   - **From:** {{from_email}}
   - **To:** cristoferagurto2@gmail.com
   
4. En el cuerpo del email, usa este template:

```html
<h2>Nuevo Pago Recibido</h2>

<p><strong>Plan:</strong> {{plan_name}}</p>
<p><strong>Precio:</strong> S/ {{plan_price}}.00</p>
<p><strong>Cliente:</strong> {{from_email}}</p>
<p><strong>Mensaje:</strong> {{message}}</p>

<p>El comprobante de pago está adjunto a este correo.</p>
```

5. Guarda el **Template ID** (ej: template_xyz789)

### 4. Obtener Public Key
1. Ve a "Account" > "General"
2. Busca "Public Key"
3. Copia la clave pública (ej: AbCdEfGhIjKlMnOp)

### 5. Actualizar el Código
Abre el archivo: `src/services/emailService.js`

Actualiza estas constantes:

```javascript
const SERVICE_ID = 'service_tu_service_id'; // Reemplaza con tu Service ID
const TEMPLATE_ID = 'template_tu_template_id'; // Reemplaza con tu Template ID
const PUBLIC_KEY = 'tu_public_key'; // Reemplaza con tu Public Key
```

### 6. Probar el Sistema
1. Inicia sesión en tu app como cliente de prueba
2. Ve al modal de pago
3. Sube un comprobante
4. Presiona "Enviar Comprobante"
5. Revisa tu correo cristoferagurto2@gmail.com

## Notas Importantes

- EmailJS tiene límite de 200 emails/mes en plan gratuito
- Los correos pueden tardar 1-5 minutos en llegar
- Verifica la carpeta de Spam si no ves el correo
- El adjunto se envía en formato base64

## Solución de Problemas

### No llegan los correos:
1. Verifica que el Service ID, Template ID y Public Key sean correctos
2. Revisa la consola del navegador (F12) por errores
3. Verifica que hayas autorizado EmailJS en tu cuenta de Gmail
4. Revisa la carpeta de Spam

### Error "Service ID not found":
- Asegúrate de que el Service ID esté escrito exactamente igual
- Verifica que el servicio esté activo en EmailJS

### Error al enviar adjunto:
- El archivo debe ser menor a 5MB
- Formatos soportados: JPG, PNG, PDF
- Intenta con un archivo más pequeño

## Soporte

Si tienes problemas, revisa la documentación oficial:
https://www.emailjs.com/docs/
