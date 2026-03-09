# Implementación: Documento Oficial / Plantilla Automática

## Resumen

Se ha implementado un sistema de **Documento Oficial** que permite asignar automáticamente una plantilla de documento a todos los clientes nuevos, evitando tener que subir documentos manualmente para cada cliente.

## Cambios Realizados

### 1. Backend

#### Nuevo Modelo: `backend/models/DocumentTemplate.js`
- Almacena plantillas de documentos
- Permite marcar una plantilla como "oficial"
- Soporta múltiples versiones de plantillas
- Solo una plantilla puede ser oficial a la vez

#### Modificación: `backend/routes/auth.js`
- Al registrar un nuevo usuario, automáticamente se crean los 12 documentos mensuales
- Los documentos se crean usando la plantilla oficial (si existe)
- Si no hay plantilla oficial, el sistema funciona como antes (documentos vacíos bajo demanda)

#### Nuevos Endpoints: `backend/routes/admin.js`
- `GET /api/admin/templates` - Listar todas las plantillas
- `GET /api/admin/templates/official` - Obtener plantilla oficial
- `POST /api/admin/templates` - Crear nueva plantilla
- `PUT /api/admin/templates/:id` - Actualizar plantilla
- `PUT /api/admin/templates/:id/official` - Establecer como oficial
- `DELETE /api/admin/templates/:id` - Eliminar plantilla
- `POST /api/admin/apply-template/:clientId` - Aplicar a cliente específico
- `POST /api/admin/apply-template-all` - Aplicar a TODOS los clientes existentes

### 2. Frontend

#### Nuevo Servicio API: `src/services/api.js`
- Agregadas funciones para gestionar plantillas:
  - `getTemplates()` - Obtener todas las plantillas
  - `getOfficialTemplate()` - Obtener plantilla oficial
  - `createTemplate()` - Crear plantilla
  - `updateTemplate()` - Actualizar plantilla
  - `setTemplateAsOfficial()` - Establecer como oficial
  - `deleteTemplate()` - Eliminar plantilla
  - `applyTemplateToClient()` - Aplicar a un cliente
  - `applyTemplateToAllClients()` - Aplicar a todos los clientes

#### Nuevo Componente: `src/components/OfficialTemplateManager.jsx`
- Interfaz para gestionar plantillas
- Ver plantilla oficial actual
- Crear nuevas plantillas
- Establecer plantilla como oficial
- Eliminar plantillas
- Aplicar plantilla oficial a todos los clientes existentes

#### Actualización: `src/components/AdminPanel.jsx`
- Nueva pestaña "Documento Oficial"
- Acceso directo al gestor de plantillas
- Actualizado el flujo de trabajo explicado

#### Nuevo Estilo: `src/components/OfficialTemplateManager.css`
- Estilos completos para la interfaz de gestión de plantillas

### 3. Script de Migración: `backend/scripts/applyOfficialTemplate.js`
- Script para aplicar la plantilla oficial a todos los clientes existentes
- Puede ejecutarse manualmente o desde el panel de admin
- Muestra estadísticas antes y después

## Cómo Usar

### Paso 1: Crear el Documento Oficial

1. Ve al **Panel de Administración**
2. Haz clic en la pestaña **"Documento Oficial"**
3. Haz clic en **"+ Crear Nueva Plantilla"**
4. Ingresa un nombre (ej: "Documento Oficial 2026")
5. Opcional: Agrega una descripción
6. Haz clic en **"Crear Plantilla"**

La plantilla se creará con:
- Los headers predeterminados del sistema
- 50 filas vacías para datos
- Estructura compatible con el sistema actual

### Paso 2: Establecer como Oficial

1. En la lista de plantillas, encuentra la que acabas de crear
2. Haz clic en **"Hacer Oficial"**
3. Confirma la acción

Ahora esta plantilla se asignará automáticamente a todos los **nuevos clientes** que se registren.

### Paso 3: Aplicar a Clientes Existentes (Opcional)

Si tienes clientes como Yudy que ya existen pero no tienen el documento oficial:

**Opción A - Desde el Panel de Admin:**
1. En la sección "Plantilla Oficial Actual"
2. Haz clic en **"Aplicar a Todos los Clientes"**
3. Confirma la advertencia

**Opción B - Script de Migración:**
```bash
cd backend
node scripts/applyOfficialTemplate.js
```

## Beneficios

✅ **No más subir documentos uno por uno**
- Cada cliente nuevo recibe automáticamente el documento oficial al registrarse

✅ **Sin problemas de sincronización**
- Los documentos se crean directamente en MongoDB, no en localStorage

✅ **Carga instantánea**
- Los clientes ven sus documentos inmediatamente, sin esperas

✅ **Formato consistente**
- Todos los clientes tienen el mismo formato base

✅ **Flexibilidad**
- Puedes editar documentos individuales si un cliente necesita algo diferente

✅ **Fácil de actualizar**
- Cambia la plantilla oficial y aplica a todos los clientes con un clic

## Notas Importantes

⚠️ **Al aplicar a todos los clientes:**
- Los documentos existentes serán **reemplazados**
- Los datos que los clientes hayan ingresado se perderán
- Úsalo solo cuando sea necesario (ej: para clientes nuevos sin datos)

✅ **Seguridad:**
- Solo los administradores pueden gestionar plantillas
- Cada cliente ve solo sus propios datos
- El documento oficial no contiene datos de clientes, solo la estructura

## Flujo de Trabajo Recomendado

1. **Configura el documento oficial** (una sola vez)
2. **Los nuevos clientes** se registran y reciben automáticamente el documento
3. **Los clientes** ingresan sus datos normalmente
4. **El admin** puede ver todos los documentos desde el panel
5. Si necesitas corregir algo en un cliente específico, usa "Gestionar Documentos" en la lista de clientes

## Soporte

Si encuentras algún problema:
1. Verifica que la plantilla oficial esté configurada
2. Revisa los logs del backend
3. Usa el script de migración para aplicar manualmente
4. Contacta soporte si persiste el problema
