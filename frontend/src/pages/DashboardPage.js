/// frontend/src/pages/DashboardPage.js
// frontend/src/pages/DashboardPage.js
import { setupDashboardLogic } from '../views/dashboard/dashboardController.js'; // Importa el controlador

// Define la ruta a tu archivo HTML del dashboard.
// Asegúrate de que este archivo exista en la ruta especificada.
const DASHBOARD_HTML_PATH = '/src/views/dashboard/index.html'; 

export async function DashboardPage(containerElement) {
    // 1. Verificar autenticación (esto es crucial y debe ir al inicio de cualquier página protegida)
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('No hay token de autenticación. Redirigiendo a /login.');
        window.router.navigate('/login');
        return; // Detiene la ejecución si no hay token
    }

    try {
        // 2. Cargar el contenido HTML del dashboard
        const response = await fetch(DASHBOARD_HTML_PATH);
        if (!response.ok) {
            throw new Error(`No se pudo cargar la plantilla HTML del Dashboard: ${response.statusText} (${response.status})`);
        }
        const htmlContent = await response.text();

        // 3. Insertar el HTML cargado en el elemento contenedor principal (el #app)
        containerElement.innerHTML = htmlContent;

        // 4. Una vez que el HTML está en el DOM, inicializar la lógica del dashboard.
        // Pasamos el 'containerElement' para que el controlador pueda operar dentro de este contexto.
        setupDashboardLogic(containerElement);

    } catch (error) {
        console.error('Error al cargar o renderizar DashboardPage:', error);
        // Muestra un mensaje de error en la interfaz si algo falla durante la carga del HTML
        containerElement.innerHTML = `<p class="error-message">Error al cargar la página del Dashboard: ${error.message}</p>`;
    }
}