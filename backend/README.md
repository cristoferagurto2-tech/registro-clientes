# 🚀 GUÍA PARA DESPLEGAR BACKEND EN RENDER.COM

## 📋 ¿Qué vamos a hacer?
Vamos a subir tu backend a internet para que funcione 24/7 y envíe emails automáticamente.

---

## ✅ PASO 1: Preparar archivos locales

### **1.1 Crear archivo .env en la carpeta backend/**
1. Ve a la carpeta `backend/`
2. Copia el archivo `.env.example` y renómbralo a `.env`
3. Abre `.env` y llena tus datos:

```
EMAIL_USER=cristoferagurto2@gmail.com
EMAIL_PASS=gfuouvrdensnskf  <-- Pega aquí tu contraseña de 16 caracteres
PORT=3001
```

**IMPORTANTE:** El archivo `.env` NO se sube a GitHub (ya está en .gitignore)

---

## ✅ PASO 2: Subir a GitHub

### **2.1 Asegúrate de tener todo en Git:**
```bash
git add .
git commit -m "Agregar backend con Nodemailer"
git push origin main
```

**Verifica que se subió:**
- Carpeta `backend/` debe estar en tu repositorio de GitHub
- Archivos: server.js, package.json, render.yaml

---

## ✅ PASO 3: Crear cuenta en Render.com

### **3.1 Registro:**
1. Ve a https://render.com
2. Clic en **"Get Started for Free"**
3. Regístrate con tu correo: **cristoferagurto2@gmail.com**
4. Verifica tu email

---

## ✅ PASO 4: Crear Web Service en Render

### **4.1 Conectar con GitHub:**
1. En el dashboard de Render, clic en **"New +"**
2. Selecciona **"Web Service"**
3. Selecciona **"Build and deploy from a Git repository"**
4. Conecta tu cuenta de GitHub
5. Busca tu repositorio: **registro-clientes**
6. Clic en **"Connect"**

### **4.2 Configurar el servicio:**
Completa estos campos:

| Campo | Valor |
|-------|-------|
| **Name** | clientcore-backend |
| **Region** | Oregon (US West) |
| **Branch** | main |
| **Root Directory** | backend |
| **Runtime** | Node |
| **Build Command** | npm install |
| **Start Command** | node server.js |
| **Plan** | Free |

### **4.3 Agregar Variables de Entorno:**
Desplázate hacia abajo a **"Environment Variables"**:

Presiona **"Add Environment Variable"** y agrega:

**Variable 1:**
- Key: `EMAIL_USER`
- Value: `cristoferagurto2@gmail.com`

**Variable 2:**
- Key: `EMAIL_PASS`
- Value: `gfuouvrdensnskf` (tu contraseña de 16 caracteres)

**Variable 3:**
- Key: `PORT`
- Value: `3001`

### **4.4 Crear servicio:**
Presiona el botón **"Create Web Service"** (botón azul abajo)

---

## ✅ PASO 5: Esperar despliegue

Render.com va a:
1. Descargar tu código
2. Instalar dependencias (`npm install`)
3. Iniciar el servidor

**Esto toma 2-5 minutos.**

Verás los logs en tiempo real. Espera a que diga:
```
✅ Servidor backend corriendo en puerto 3001
📧 Configurado para enviar emails a: cristoferagurto2@gmail.com
```

---

## ✅ PASO 6: Obtener URL del backend

Cuando termine, verás arriba una URL como:
```
https://clientcore-backend.onrender.com
```

**Copia esta URL**, la necesitas para el paso 7.

---

## ✅ PASO 7: Actualizar frontend con la URL

### **7.1 Abre el archivo:**
`src/services/emailService.js`

### **7.2 Cambia la URL:**
Busca esta línea:
```javascript
const API_URL = 'https://clientcore-backend.onrender.com';
```

Si tu URL es diferente, cámbiala. Por ejemplo:
```javascript
const API_URL = 'https://clientcore-backend.onrender.com';
```

### **7.3 Guarda y sube a GitHub:**
```bash
git add .
git commit -m "Actualizar URL del backend"
git push origin main
```

---

## ✅ PASO 8: Probar que funciona

### **8.1 Prueba local:**
1. En tu computadora, abre terminal
2. Ve a la carpeta backend:
   ```bash
   cd backend
   npm install
   npm start
   ```
3. El servidor debe iniciar en http://localhost:3001

### **8.2 Abre tu página:**
1. En otra terminal, inicia tu frontend:
   ```bash
   npm run dev
   ```
2. Ve al navegador: http://localhost:5173
3. Inicia sesión como cliente
4. Presiona "Suscribirse Ahora"
5. Sube un comprobante de prueba
6. Presiona "Enviar Comprobante"

### **8.3 Verifica tu correo:**
Revisa **cristoferagurto2@gmail.com**

Debe llegar un email con:
- Asunto: "Nuevo Pago Recibido"
- El comprobante adjunto

---

## ⚠️ IMPORTANTE: Limitaciones del plan gratuito

### **El servidor "duerme":**
- Después de 15 minutos sin usar, el servidor se "duerme"
- Cuando alguien lo usa, tarda 30-60 segundos en "despertar"
- **Solución:** El primer email puede tardar un poco, los siguientes son instantáneos

### **Mensualidad:**
- **Gratis:** 750 horas/mes (suficiente para 1 servidor 24/7)
- Si necesitas más, cuesta $7/mes

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **"Backend no disponible"**
- Verifica que la URL en emailService.js sea correcta
- Revisa que el servidor esté corriendo en Render.com

### **"Error al enviar email"**
- Verifica que EMAIL_PASS esté correcta en Render.com
- Asegúrate de que sea la contraseña de aplicación (16 caracteres)

### **"El servidor no inicia"**
- Revisa los logs en Render.com
- Verifica que package.json esté correcto

---

## 📞 AYUDA

Si tienes problemas:
1. Revisa los logs en Render.com (pestaña "Logs")
2. Verifica que las variables de entorno estén correctas
3. Asegúrate de que el archivo .env.example se subió (sin tu contraseña real)

---

## 🎉 ¡LISTO!

Una vez funcionando:
- ✅ Backend funcionando 24/7
- ✅ Emails ilimitados
- ✅ Comprobantes automáticos
- ✅ Gratis

**¿Empezamos con el Paso 1?**
