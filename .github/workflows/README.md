# Configuración de GitHub Actions para Auto-Deploy

Este workflow se ejecuta automáticamente en cada push a la rama `main`.

## Configuración necesaria

### 1. Configurar Secrets en GitHub

Ve a tu repositorio en GitHub → Settings → Secrets and variables → Actions → New repository secret

#### Secrets requeridos:

**RENDER_DEPLOY_HOOK_URL**
```
https://api.render.com/deploy/srv-d6ge5jvkijhs73er22u0?key=-kcHoCqh2eM
```

**CLOUDFLARE_API_TOKEN** (Opcional - solo si quieres deploy manual en Cloudflare)
- Ve a https://dash.cloudflare.com/profile/api-tokens
- Crea un token con permisos para Cloudflare Pages

**CLOUDFLARE_ACCOUNT_ID** (Opcional)
- Lo encuentras en el dashboard de Cloudflare (generalmente en la barra lateral)

### 2. Verificar que funcione

1. Haz un push a la rama `main`
2. Ve a la pestaña "Actions" en tu repo de GitHub
3. Deberías ver el workflow ejecutándose
4. Una vez terminado, tanto Render como Cloudflare Pages deberían estar actualizados

## Notas importantes

- El backend (Render) se actualiza automáticamente con cada push
- El frontend (Cloudflare Pages) también se actualiza automáticamente
- Puedes ver el estado de los deploys en la pestaña "Actions"
- Si falla algo, recibirás notificación por email
