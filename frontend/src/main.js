// frontend/src/main.js
// frontend/src/main.js

import { Router } from './router/router.js';
import { LoginPage } from './pages/LoginPage.js';
// import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { GestionEmpleadosPage } from './pages/GestionEmpleadosPage.js';
// ✅ Nuevas importaciones
import { GestionMenuPage } from './pages/GestionMenuPage.js';
import { GestionPedidosPage } from './pages/GestionPedidosPage.js';
import { EstadoPedidosPage } from './pages/EstadoPedidosPage.js';
import { GestionCocinaPage } from './pages/GestionCocinaPage.js';
import { ProcesamientoPagosPage } from './pages/ProcesamientoPagosPage.js';
import { ReportesPage } from './pages/ReportesPage.js';

const appRoot = document.getElementById('app-root');
const router = new Router(appRoot);
window.router = router;

// Definición de Rutas
router.addRoute('/', LoginPage);
router.addRoute('/login', LoginPage);
// router.addRoute('/register', RegisterPage);
router.addRoute('/dashboard', DashboardPage);
router.addRoute('/gestion-empleados', GestionEmpleadosPage);
// ✅ Nuevas rutas
router.addRoute('/gestion-menu', GestionMenuPage);
router.addRoute('/gestion-pedidos', GestionPedidosPage);
router.addRoute('/estado-pedidos', EstadoPedidosPage);
router.addRoute('/gestion-cocina', GestionCocinaPage);
router.addRoute('/procesamiento-pagos', ProcesamientoPagosPage);
router.addRoute('/reportes', ReportesPage);

router.start();

