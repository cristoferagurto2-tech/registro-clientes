# DICCIONARIO EMAILJS - ESPAÑOL/INGLÉS

## 🌐 CAMBIAR IDIOMA EN EMAILJS

1. Arriba a la derecha busca tu foto de perfil o nombre
2. Haz clic y busca "Settings" (Configuración)
3. Busca "Language" (Idioma)
4. Selecciona "Español" si está disponible

---

## 📋 TRADUCCIÓN DE BOTONES Y MENÚS

### **MENÚ PRINCIPAL (Izquierda)**

| EN INGLÉS | EN ESPAÑOL | ¿QUÉ ES? |
|-----------|------------|----------|
| Dashboard | Panel Principal | Página inicial con resumen |
| Email Services | Servicios de Email | Donde configuras Gmail/SMTP |
| Email Templates | Plantillas de Email | Diseño de los correos |
| Contacts | Contactos | Lista de emails |
| Campaigns | Campañas | Envíos masivos |
| API Keys | Claves API | Códigos de seguridad |
| Account | Cuenta | Configuración de tu perfil |
| Billing | Facturación | Pagos y plan actual |

---

### **BOTONES COMUNES**

| EN INGLÉS | EN ESPAÑOL | ACCIÓN |
|-----------|------------|--------|
| Add New Service | Agregar Nuevo Servicio | Crear conexión de email |
| Create New Template | Crear Nueva Plantilla | Diseñar correo |
| Save | Guardar | Guardar cambios |
| Delete | Eliminar | Borrar |
| Edit | Editar | Modificar |
| Copy | Copiar | Duplicar |
| Test | Probar | Enviar prueba |
| Cancel | Cancelar | Cerrar sin guardar |
| Connect Account | Conectar Cuenta | Vincular Gmail |
| Create Service | Crear Servicio | Guardar configuración |
| Add New Project | Agregar Nuevo Proyecto | Nuevo grupo de correos |
| Get Started | Comenzar | Empezar tutorial |

---

### **CREAR SERVICIO SMTP (PASO A PASO TRADUCIDO)**

Cuando presiones "Add New Service" verás:

**Paso 1: Seleccionar tipo**
```
Select Service Type = Seleccionar Tipo de Servicio

Opciones que verás:
- Gmail = Gmail (NO uses esto, da error)
- Outlook = Outlook/Hotmail
- Yahoo = Yahoo Mail
- SMTP = SMTP (USA ESTE ✅)
```

**Paso 2: Formulario SMTP**
```
Name = Nombre
  └─ Escribe: Gmail SMTP

SMTP Host = Servidor SMTP
  └─ Escribe: smtp.gmail.com

Port = Puerto
  └─ Selecciona: 587 (o escribe 587)

Username = Nombre de Usuario
  └─ Escribe: cristoferagurto2@gmail.com

Password = Contraseña
  └─ Pega aquí tu contraseña de 16 caracteres

Encryption = Encriptación
  └─ Selecciona: TLS (o SSL/TLS)

From Email = Email Remitente
  └─ Escribe: cristoferagurto2@gmail.com

From Name = Nombre Remitente
  └─ Escribe: ClientCore
```

**Paso 3: Guardar**
```
Create Service = Crear Servicio (botón verde)
```

---

### **CREAR PLANTILLA DE EMAIL**

Cuando vayas a "Email Templates" > "Create New Template":

**Formulario principal:**
```
Template Name = Nombre de Plantilla
  └─ Escribe: Notificación de Pago

Subject = Asunto
  └─ Escribe: Nuevo Pago Recibido

From = De/Remitente
  └─ Selecciona: cristoferagurto2@gmail.com

To = Para/Destinatario
  └─ Escribe: cristoferagurto2@gmail.com
```

**Área de diseño (HTML Body):**
```
HTML Body = Cuerpo HTML
  └─ Aquí pega el código del correo

Preview = Vista Previa
  └─ Muestra cómo se verá el correo

Variables = Variables
  └─ Códigos como {{plan_name}} que se reemplazan
```

**Botones:**
```
Save Template = Guardar Plantilla
Test Template = Probar Plantilla
```

---

### **OBTENER CÓDIGOS (IDS)**

**Service ID (ID de Servicio):**
```
Después de crear el servicio SMTP verás:

Service ID: service_abc123
            ↑ Este es el código que necesitas copiar
            
Se ve así: service_XXXXXXXXXXX (letras y números)
```

**Template ID (ID de Plantilla):**
```
Después de guardar la plantilla verás:

Template ID: template_xyz789
             ↑ Este es el código que necesitas copiar
             
Se ve así: template_XXXXXXXXXXX (letras y números)
```

**Public Key (Clave Pública):**
```
Ve a: Account (Cuenta) > General (General)

Busca: Public Key
       ↓
       AbCdEfGhIjKlMnOpQrStUvWxYz123456
       ↑ Código largo, cópialo todo
```

---

### **MENSAJES DE ERROR COMUNES**

| EN INGLÉS | SIGNIFICADO | SOLUCIÓN |
|-----------|-------------|----------|
| Invalid Service ID | ID de servicio inválido | Revisa que esté bien escrito |
| Template not found | Plantilla no encontrada | El Template ID está mal |
| Authentication failed | Falló autenticación | Contraseña incorrecta |
| Insufficient scopes | Alcance insuficiente | Usar SMTP en vez de Gmail |
| Rate limit exceeded | Límite excedido | Espera unos minutos |
| Invalid public key | Clave pública inválida | Revisa la Public Key |

---

## ✅ CHECKLIST RÁPIDO

Después de cada paso, verifica:

- [ ] Creé el servicio **SMTP** (no Gmail)
- [ ] Usé mi contraseña de 16 caracteres
- [ ] Copié el **Service ID** (empieza con service_)
- [ ] Creé la plantilla con nombre
- [ ] Copié el **Template ID** (empieza con template_)
- [ ] Encontré la **Public Key** en Account > General
- [ ] Los 3 códigos están en mi archivo emailService.js

---

## 📞 SOPORTE EN ESPAÑOL

Si necesitas ayuda en EmailJS:
1. Busca "Help" o "Support" (Ayuda o Soporte)
2. O ve directo a: https://www.emailjs.com/docs/
3. Usa Google Translate en la página si está en inglés

---

## 🎯 RESUMEN

**Lo que DEBES hacer:**
1. Crea servicio tipo **SMTP** (no Gmail)
2. Pega tu contraseña de 16 caracteres
3. Guarda y copia los 3 códigos
4. Pega códigos en tu archivo

**Lo que NO debes hacer:**
❌ Usar la opción "Gmail" (da error 412)
❌ Usar tu contraseña normal de Gmail
❌ Omitir algún campo en el formulario

---

**¿Necesitas que te ayude con algún paso específico?** 
¿En qué pantalla estás ahora?
