// frontend/src/main.js
import { Router } from './utils/router.js'; // Tu router importado
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';

const appRoot = document.getElementById('app-root');
const router = new Router(appRoot); // Pasar el elemento raíz al router

// Definir las rutas
router.addRoute('/', () => {
    // Lógica para decidir si redirigir a login o dashboard
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        router.navigate('/dashboard', false); // Redirigir sin añadir al historial si ya estás en home
    } else {
        router.navigate('/login', false);
    }
});
router.addRoute('/login', LoginPage);
router.addRoute('/register', RegisterPage);
router.addRoute('/dashboard', DashboardPage);

router.addRoute('/gestion-empleados/registrar', RegisterPage);

// Iniciar el router en la carga inicial de la página
router.start();

// Evento para manejar el botón de cerrar sesión si estás en el dashboard
window.addEventListener('logout', () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    router.navigate('/login');
});