# 🚀 CONFIGURACIÓN RÁPIDA PARA RENDER.COM
# Copia todo esto en Render.com y funcionará inmediatamente

## DATOS PARA PEGAR EN RENDER.COM:

### 1. Nombre del servicio:
```
clientcore-backend
```

### 2. Build Command:
```
npm install
```

### 3. Start Command:
```
node server.js
```

### 4. Variables de Entorno (Environment Variables):

**Variable 1:**
- Key: `EMAIL_USER`
- Value: `cristoferagurto2@gmail.com`

**Variable 2:**
- Key: `EMAIL_PASS`
- Value: `gfuouvrdensnskf`

**Variable 3:**
- Key: `PORT`
- Value: `3001`

**Variable 4:**
- Key: `NODE_VERSION`
- Value: `18`

---

## 📋 INSTRUCCIONES PASO A PASO:

### PASO 1: Ir a Render.com
1. Abre https://render.com
2. Inicia sesión con tu cuenta

### PASO 2: Crear nuevo servicio
1. Clic en el botón **"New +"** (azul, arriba a la derecha)
2. Selecciona **"Web Service"**
3. Selecciona **"Build and deploy from a Git repository"**
4. Busca tu repositorio: **cristoferagurto2-tech/registro-clientes**
5. Clic en **"Connect"**

### PASO 3: Configurar (PEGA ESTOS DATOS):

| Campo | Valor |
|-------|-------|
| Name | clientcore-backend |
| Region | Oregon (US West) |
| Branch | main |
| Root Directory | backend |
| Runtime | Node |
| Build Command | npm install |
| Start Command | node server.js |
| Plan | Free |

### PASO 4: Agregar Variables de Entorno:
1. Desplázate hacia abajo hasta **"Environment Variables"**
2. Clic en **"Add Environment Variable"**
3. Agrega UNA POR UNA:

**Primera variable:**
- Key: `EMAIL_USER`
- Value: `cristoferagurto2@gmail.com`

**Segunda variable:**
- Key: `EMAIL_PASS`
- Value: `gfuouvrdensnskf`

**Tercera variable:**
- Key: `PORT`
- Value: `3001`

**Cuarta variable:**
- Key: `NODE_VERSION`
- Value: `18`

### PASO 5: Crear el servicio
1. Desplázate hasta abajo
2. Clic en el botón **"Create Web Service"** (azul)
3. Espera 2-5 minutos a que termine el despliegue

### PASO 6: Obtener tu URL
1. Cuando termine, arriba verás una URL como:
   ```
   https://clientcore-backend.onrender.com
   ```
2. **Copia esa URL completa**

### PASO 7: Actualizar tu frontend
1. Abre el archivo: `src/services/emailService.js`
2. Busca esta línea:
   ```javascript
   const API_URL = 'https://clientcore-backend.onrender.com';
   ```
3. Si tu URL es diferente, cámbiala (pero probablemente sea esa)
4. Guarda el archivo

### PASO 8: Subir cambios
```bash
git add .
git commit -m "Actualizar URL del backend"
git push origin main
```

---

## ✅ VERIFICACIÓN:

### Prueba local primero:
```bash
cd backend
npm install
npm start
```

Debe decir:
```
✅ Servidor backend corriendo en puerto 3001
📧 Configurado para enviar emails a: cristoferagurto2@gmail.com
```

### Luego prueba en producción:
1. Abre tu página web
2. Inicia sesión como cliente
3. Presiona "Suscribirse Ahora"
4. Sube un comprobante de prueba
5. Presiona "Enviar Comprobante"
6. Revisa tu correo en 1-5 minutos

---

## 🐛 SI NO FUNCIONA:

### Error "Backend no disponible":
- Verifica que la URL en `emailService.js` sea exactamente la misma que te dio Render

### Error "Contraseña incorrecta":
- Ve a Render.com > tu servicio > Environment Variables
- Verifica que EMAIL_PASS sea exactamente: `gfuouvrdensnskf` (sin espacios)

### El servidor no inicia:
- Ve a Render.com > Logs (pestaña arriba)
- Mira si hay errores rojos
- Asegúrate de que el Root Directory sea `backend`

---

## 📞 AYUDA:
Si tienes problemas, revisa los logs en Render.com:
1. Ve a tu servicio en Render
2. Clic en "Logs" (arriba)
3. Mira los mensajes de error

---

## 🎉 LISTO PARA USAR:
Una vez configurado:
- ✅ Emails ilimitados
- ✅ Gratis 24/7
- ✅ Comprobantes automáticos
- ✅ Sin estrés para ti ni tus clientes
