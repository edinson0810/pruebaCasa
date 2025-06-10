/// frontend/src/pages/DashboardPage.js

// frontend/src/pages/DashboardPage.js

const DASHBOARD_HTML_PATH = '/src/views/dashboard/index.html';

export async function DashboardPage(containerElement) {
    const token = localStorage.getItem('token');

    if (!token) {
        console.warn('No hay token de autenticación. Redirigiendo a /login.');
        window.router.navigate('/login');
        return;
    }

    try {
        const response = await fetch(DASHBOARD_HTML_PATH);
        if (!response.ok) {
            throw new Error(`No se pudo cargar la plantilla HTML del dashboard: ${response.statusText} (${response.status})`);
        }
        const htmlContent = await response.text();
        containerElement.innerHTML = htmlContent;

        const userNameElement = containerElement.querySelector('#userName');
        const userRoleElement = containerElement.querySelector('#userRole');
        const logoutButton = containerElement.querySelector('#logoutButton');

        // Selectores para todos los botones
        const gestionEmpleadosLink = containerElement.querySelector('#gestionEmpleadosLink');
        const gestionMenuLink = containerElement.querySelector('#gestionMenuLink');
        const gestionPedidosLink = containerElement.querySelector('#gestionPedidosLink');
        const estadoPedidosLink = containerElement.querySelector('#estadoPedidosLink');
        const gestionCocinaLink = containerElement.querySelector('#gestionCocinaLink');
        const procesamientoPagosLink = containerElement.querySelector('#procesamientoPagosLink');
        const reportesLink = containerElement.querySelector('#reportesLink');

        const userName = localStorage.getItem('userName') || 'Usuario';
        const userRole = localStorage.getItem('userRole') || 'desconocido';

        if (userNameElement) userNameElement.textContent = userName;
        if (userRoleElement) userRoleElement.textContent = userRole;

        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userName');
                localStorage.removeItem('userRole');
                window.router.navigate('/login');
            });
        }

        // Lógica de navegación para cada botón
        if (gestionEmpleadosLink) {
            gestionEmpleadosLink.addEventListener('click', (event) => {
                event.preventDefault();
                window.router.navigate('/gestion-empleados');
            });
        }

        if (gestionMenuLink) {
            gestionMenuLink.addEventListener('click', (event) => {
                event.preventDefault();
                window.router.navigate('/gestion-menu'); // Nueva ruta
            });
        }

        if (gestionPedidosLink) {
            gestionPedidosLink.addEventListener('click', (event) => {
                event.preventDefault();
                window.router.navigate('/gestion-pedidos'); // Nueva ruta
            });
        }

        if (estadoPedidosLink) {
            estadoPedidosLink.addEventListener('click', (event) => {
                event.preventDefault();
                window.router.navigate('/estado-pedidos'); // Nueva ruta
            });
        }

        if (gestionCocinaLink) {
            gestionCocinaLink.addEventListener('click', (event) => {
                event.preventDefault();
                window.router.navigate('/gestion-cocina'); // Nueva ruta
            });
        }

        if (procesamientoPagosLink) {
            procesamientoPagosLink.addEventListener('click', (event) => {
                event.preventDefault();
                window.router.navigate('/procesamiento-pagos'); // Nueva ruta
            });
        }

        if (reportesLink) {
            reportesLink.addEventListener('click', (event) => {
                event.preventDefault();
                window.router.navigate('/reportes'); // Nueva ruta
            });
        }

    } catch (error) {
        console.error('Error al cargar o renderizar DashboardPage:', error);
        containerElement.innerHTML = `<p class="error-message">Error al cargar la página del Dashboard: ${error.message}</p>`;
    }
}