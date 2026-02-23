# GUÍA PARA RECIBIR COMPROBANTES EN TU CORREO

## ¿Qué vamos a hacer?
Vamos a configurar tu página para que cuando un cliente pague, automáticamente te llegue un correo a **cristoferagurto2@gmail.com** con el comprobante adjunto.

---

## PASO 1: Crear tu cuenta (5 minutos)

1. **Entra a esta página:** https://www.emailjs.com/
2. **Busca el botón** que dice "Get Started Free" (Comenzar Gratis)
3. **Regístrate usando tu correo:** cristoferagurto2@gmail.com
4. **Crea una contraseña** y guardala
5. **Entra a tu correo** (cristoferagurto2@gmail.com) y busca un email de EmailJS
6. **Abre el email** y presiona el botón para verificar tu cuenta

✅ **Listo:** Ya tienes tu cuenta de EmailJS

---

## PASO 2: Conectar con Gmail (3 minutos)

1. **En la página de EmailJS**, busca en el menú izquierdo: "Email Services" (Servicios de Email)
2. **Presiona el botón** que dice "Add New Service" (Agregar Nuevo Servicio)
3. **Aparecerá una lista**, busca y selecciona: **Gmail**
4. **Presiona el botón** "Connect Account" (Conectar Cuenta)
5. **Se abrirá una ventana** pidiendo que inicies sesión en Gmail
6. **Ingresa tu correo:** cristoferagurto2@gmail.com
7. **Ingresa tu contraseña** de Gmail
8. **Presiona "Permitir"** o "Autorizar" para que EmailJS pueda enviar correos
9. **Verás un código** que empieza con "service_" (por ejemplo: service_abc123)
10. **Copia ese código** y guárdalo en un papel

✅ **Importante:** Ese código que empieza con "service_" es tu **Service ID**

---

## PASO 3: Crear la plantilla del correo (5 minutos)

1. **En el menú izquierdo**, busca: "Email Templates" (Plantillas de Email)
2. **Presiona el botón:** "Create New Template" (Crear Nueva Plantilla)
3. **Aparecerá un formulario**, llena así:

**En la casilla "Template Name"** escribe:
```
Notificación de Pago
```

**En la casilla "Subject"** escribe:
```
Nuevo Pago Recibido - {{plan_name}}
```

**En la casilla "From"** escribe:
```
{{from_email}}
```

**En la casilla "To"** escribe:
```
cristoferagurto2@gmail.com
```

4. **En la caja grande** donde dice "HTML Body", borra todo y pega esto:

```html
<h2 style="color: #2563eb;">💰 Nuevo Pago Recibido</h2>

<hr>

<p><strong>Plan Contratado:</strong> {{plan_name}}</p>
<p><strong>Monto:</strong> S/ {{plan_price}}.00</p>
<p><strong>Email del Cliente:</strong> {{from_email}}</p>
<p><strong>Mensaje:</strong> {{message}}</p>

<hr>

<p style="color: #166534;">✅ El comprobante de pago está adjunto a este correo.</p>

<p style="color: #6b7280; font-size: 12px;">Este mensaje fue enviado automáticamente desde ClientCore.</p>
```

5. **Presiona el botón "Save"** (Guardar)
6. **Te aparecerá un código** que empieza con "template_" (por ejemplo: template_xyz789)
7. **Copia ese código** y guárdalo en el mismo papel

✅ **Importante:** Ese código que empieza con "template_" es tu **Template ID**

---

## PASO 4: Obtener tu clave secreta (1 minuto)

1. **Busca en el menú** la opción "Account" (Cuenta) o haz clic en tu foto de perfil arriba a la derecha
2. **Selecciona:** "General" (General)
3. **Busca la sección** que dice "Public Key" (Clave Pública)
4. **Verás un código largo** (por ejemplo: AbCdEfGhIjKlMnOpQrStUvWxYz123456)
5. **Copia ese código** y guárdalo en el papel

✅ **Importante:** Ese código largo es tu **Public Key**

---

## PASO 5: Poner los códigos en tu página (2 minutos)

**Ahora necesitas abrir tu proyecto en Visual Studio Code**

1. **Abre Visual Studio Code**
2. **Busca la carpeta** de tu proyecto (Pagina_Wed)
3. **En el explorador de archivos** (lado izquierdo), busca la carpeta "src"
4. **Dentro de "src", busca la carpeta** "services"
5. **Abre el archivo** llamado "emailService.js"

**Verás algo así:**
```javascript
const SERVICE_ID = 'service_tu_service_id';
const TEMPLATE_ID = 'template_tu_template_id';
const PUBLIC_KEY = 'tu_public_key';
```

**Reemplaza con tus códigos:**

```javascript
const SERVICE_ID = 'service_abc123';      // Pega aquí tu Service ID
const TEMPLATE_ID = 'template_xyz789';    // Pega aquí tu Template ID  
const PUBLIC_KEY = 'AbCdEfGhIjKlMnOp';    // Pega aquí tu Public Key
```

**Guarda el archivo** (Ctrl + S o Cmd + S)

✅ **Listo:** Tu página ya puede enviar correos

---

## PASO 6: Probar que funciona

1. **Abre tu página** en el navegador (npm run dev)
2. **Inicia sesión** como cliente de prueba (no como admin)
3. **Presiona el botón** "Suscribirse Ahora"
4. **Sube cualquier imagen** (puede ser una foto de prueba)
5. **Presiona** "Enviar Comprobante"
6. **Espera 2-5 minutos**
7. **Entra a tu correo:** cristoferagurto2@gmail.com
8. **Busca un email** con el asunto "Nuevo Pago Recibido"

🎉 **¡Si ves el correo con el archivo adjunto, todo está funcionando!**

---

## ⚠️ NOTAS IMPORTANTES

### ¿Cuántos correos puedo recibir?
- **Gratis:** 200 correos por mes (más que suficiente para empezar)
- Si necesitas más, el plan pago cuesta $5 al mes

### ¿Cuánto tarda en llegar el correo?
- Normalmente entre **1 y 5 minutos**
- A veces puede tardar hasta 15 minutos

### ¿No te llegó el correo?
Revisa estas carpetas:
1. **Spam** o **Correo no deseado**
2. **Promociones** (en Gmail)
3. **Todos los correos**

### ¿El archivo adjunto no se ve?
- El archivo debe ser **menor a 5MB**
- Formatos permitidos: **JPG, PNG, PDF**

---

## ❌ SOLUCIÓN DE PROBLEMAS

### "Error: Service ID not found"
**Significa:** El código del Service ID está mal escrito
**Solución:** Copia y pega exactamente como aparece en EmailJS (incluye las letras minúsculas)

### "Error: Template ID not found"
**Significa:** El código del Template ID está mal escrito
**Solución:** Copia y pega exactamente como aparece en EmailJS

### "No autorizado"
**Significa:** No autorizaste a EmailJS en tu Gmail
**Solución:** 
1. Ve a tu Gmail
2. Busca "Aplicaciones con acceso a tu cuenta"
3. Busca EmailJS y presiona "Permitir"

### "Error al enviar adjunto"
**Significa:** El archivo es muy grande o formato no soportado
**Solución:** 
1. Usa una imagen más pequeña (menor a 5MB)
2. Usa JPG, PNG o PDF únicamente

---

## 📞 AYUDA

Si algo no funciona:
1. Revisa que copiaste bien los 3 códigos (sin espacios)
2. Guarda el archivo después de editarlo
3. Reinicia tu página (presiona F5)
4. Intenta enviar de nuevo

**Página de ayuda oficial:** https://www.emailjs.com/docs/

---

## ✅ RESUMEN RÁPIDO

Necesitas 3 códigos de EmailJS:
1. **Service ID** (empieza con: service_)
2. **Template ID** (empieza con: template_)
3. **Public Key** (es un código largo)

Pega esos 3 códigos en el archivo: `src/services/emailService.js`

**Tu correo destino:** cristoferagurto2@gmail.com

**¡Listo para recibir pagos!** 💰
