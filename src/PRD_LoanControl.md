# PRD – LoanControl
Sistema Administrativo de Registro de Créditos
Versión 1.0 – MVP Simplificado

---

## 1. Descripción General

LoanControl es un sistema web SaaS diseñado exclusivamente para registrar y administrar información de créditos otorgados por el usuario.

El sistema NO otorga préstamos.
El sistema NO define tasas.
El sistema NO procesa pagos.
El sistema NO realiza asesoría financiera o legal.

Su función es únicamente administrativa y de registro.

---

## 2. Objetivo del Producto

Permitir a usuarios registrar, visualizar y organizar información de clientes y créditos en un entorno digital estructurado.

---

## 3. Público Objetivo

- Personas que gestionan préstamos manualmente.
- Microprestamistas que desean digitalizar su registro.
- Usuarios que actualmente utilizan Excel o cuadernos físicos.

---

## 4. Alcance del MVP

### 4.1 Gestión de Usuarios
- Registro con correo y contraseña.
- Inicio de sesión.
- Recuperación de contraseña.
- Cada usuario solo ve su propia información.

---

### 4.2 Gestión de Clientes
Campos obligatorios:
- Nombre completo
- DNI
- Teléfono

Funciones:
- Crear cliente
- Editar cliente
- Eliminar cliente
- Listar clientes

---

### 4.3 Gestión de Créditos
Campos obligatorios:
- Cliente asociado
- Monto del crédito (moneda base: Soles - S/)
- Fecha de inicio
- Fecha de vencimiento

Campo opcional:
- Notas internas

---

### 4.4 Estado del Crédito (Lógica Automática)

El estado NO es editable manualmente.

Se calcula automáticamente:

- Activo → si la fecha actual es menor o igual a la fecha de vencimiento.
- Moroso → si la fecha actual es mayor a la fecha de vencimiento.
- Pagado → si el usuario marca manualmente el crédito como pagado.

Regla de vencimiento:
Un crédito se considera vencido 1 día después de la fecha de vencimiento registrada.

---

### 4.5 Dashboard

El panel principal mostrará:

- Total de créditos registrados
- Total de créditos activos
- Total de créditos morosos
- Total de créditos pagados
- Monto total prestado
- Monto pendiente estimado

---

## 5. Limitaciones del Sistema

- No calcula intereses automáticamente.
- No procesa pagos.
- No genera contratos.
- No realiza evaluación crediticia.
- No verifica información del cliente.
- No se integra con bancos ni pasarelas de pago.

---

## 6. Modelo de Negocio

Sistema SaaS con suscripción mensual.

### 6.1 Periodo de Prueba
- 7 días gratuitos.
- Acceso completo a todas las funcionalidades.
- No se requiere tarjeta durante el registro.

### 6.2 Post-Periodo de Prueba
Al finalizar los 7 días:

- El usuario no podrá crear nuevos créditos.
- Podrá visualizar información en modo lectura.
- Los datos no se eliminan.
- Para reactivar funciones deberá suscribirse.

---

### 6.3 Planes

Plan Básico – S/ 30 mensuales
- Hasta 100 créditos activos
- 1 usuario por cuenta
- Dashboard estándar

Plan Profesional – S/ 60 mensuales
- Créditos ilimitados
- Hasta 3 usuarios por cuenta
- Exportación básica a Excel (futuro)

---

## 7. Requisitos Técnicos del MVP

### Backend
- Node.js con Express

### Base de Datos
- PostgreSQL

### Autenticación
- Hash de contraseñas con bcrypt
- Tokens JWT para sesión

### Seguridad
- Cifrado HTTPS obligatorio
- Cifrado de campos sensibles:
  - DNI
  - Teléfono

---

## 8. Arquitectura General

Frontend (Web)
↓
Backend API (Node.js)
↓
Base de Datos PostgreSQL

---

## 9. Riesgo Regulatorio

El sistema es una herramienta administrativa.

No interviene en:
- Definición de tasas
- Contratos
- Desembolso
- Cobranza

El uso indebido del sistema es responsabilidad exclusiva del usuario.

---

## 10. Métricas de Éxito del MVP

- 30% conversión de prueba a pago.
- Tiempo promedio de registro de crédito < 2 minutos.
- Retención de usuarios al mes > 60%.
- Tasa de errores en registro < 5%.

---

## 11. Futuras Mejoras (No incluidas en MVP)

- Cálculo automático de intereses.
- Recordatorios automáticos por WhatsApp.
- Reportes avanzados.
- Control de cuotas.
- Multiempresa.