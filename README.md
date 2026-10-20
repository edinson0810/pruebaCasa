# 🍽️ Restaurant Management System (Full Stack & SQL Database)

## 📌 Descripción
Sistema transaccional de gestión para restaurantes diseñado para optimizar el flujo operativo entre cocina, salón y administración. Implementa control de acceso basado en roles (**RBAC**), gestión de pedidos en tiempo real y una arquitectura relacional sólida para garantizar la integridad de los datos.

Este proyecto sirve como demostración práctica para **Pruebas de Integración (QA Testing)**, validación de reglas de negocio en la capa de datos y pruebas de flujos multiusuario.

---

## 👥 Roles del Sistema y Flujo Operativo

El sistema administra permisos y visibilidad según 3 roles clave:

| Rol | Funcionalidades Principales | Módulos & Permisos |
| :--- | :--- | :--- |
| **👨‍💼 Administrador** | Gestión global del restaurante, configuración de menús, usuarios y reportes generales. | Menú, Usuarios, Reportes, Configuración. |
| **🤵 Mesero** | Apertura de comandas, toma e ingreso de pedidos por mesa, cambio de estado de órdenes. | Toma de Pedidos, Estado de Mesas. |
| **👨‍🍳 Cocinero** | Visualización en tiempo real de comandas pendientes, actualización de estado de platos. | Pantalla de Cocina / Pedidos Activos. |

---

## 🛠️ Arquitectura y Tecnologías
* **Base de Datos:** SQL (`restaurant_system.sql`) con modelo relacional normalizado para usuarios, roles, mesas, categorías, platos y pedidos.
* **Backend:** API REST para el procesamiento de transacciones y autenticación/autorización de usuarios.
* **Frontend:** Interfaz web interactiva adaptada según el perfil del usuario autenticado.
* **QA & Control de Versiones:** Git/GitHub, diseñado para pruebas de integridad referencial, consistencia de datos y casos de uso de permisos.

---

## 📂 Estructura del Repositorio

```text
pruebaCasa/
├── backend/                # API y lógica del servidor
├── frontend/               # Interfaz de usuario web
├── restaurant_system.sql   # Script de creación del esquema relacional y datos de prueba
└── baseDatos.txt           # Documentación y configuración del modelo ER
