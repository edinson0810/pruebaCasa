// frontend/src/pages/GestionEmpleadosPage.js

// frontend/src/pages/GestionEmpleadosPage.js

// Importa la lógica JavaScript específica para la gestión de empleados
import { setupEmpleadosPageLogic } from '../views/empleados/empleadosController.js';

// Ruta al archivo HTML de la vista de empleados
const EMPLEADOS_HTML_PATH = '/src/views/empleados/index.html';

export async function GestionEmpleadosPage(containerElement) {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('No hay token de autenticación. Redirigiendo a /login.');
        window.router.navigate('/login');
        return;
    }

    try {
        const response = await fetch(EMPLEADOS_HTML_PATH);
        if (!response.ok) {
            throw new Error(`No se pudo cargar la plantilla HTML de empleados: ${response.statusText} (${response.status})`);
        }
        const htmlContent = await response.text();

        containerElement.innerHTML = htmlContent; // Inyecta el HTML
        setupEmpleadosPageLogic(containerElement); // Ejecuta la lógica después de que el HTML esté en el DOM

    } catch (error) {
        console.error('Error al cargar o renderizar GestionEmpleadosPage:', error);
        containerElement.innerHTML = `<p class="error-message">Error al cargar la página de Gestión de Empleados: ${error.message}</p>`;
    }
}