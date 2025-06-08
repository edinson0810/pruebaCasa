// frontend/src/pages/DashboardPage.js

export function DashboardPage(containerElement) {
    const userName = localStorage.getItem('userName') || 'usuario';
    const userRole = localStorage.getItem('userRole');

    const parsedUserRole = parseInt(userRole, 10);

    containerElement.innerHTML = `
        <div class="dashboard-container">
            <h2>Bienvenido al Dashboard</h2>
            <p>Has iniciado sesión exitosamente como <span id="dashboardUserName">${userName}</span>.</p>

            <div class="dashboard-buttons">
                <button id="gestionEmpleadosBtn" class="dashboard-btn">Gestión de Empleados</button>
                <button id="gestionMenuBtn" class="dashboard-btn">Gestión de Menú</button>
                <button id="gestionPedidosBtn" class="dashboard-btn">Gestión de Pedidos</button>
                <button id="estadosPedidosBtn" class="dashboard-btn">Estados de Pedidos</button> <button id="gestionCocinaBtn" class="dashboard-btn">Gestión de Cocina</button>
                <button id="procesamientoPagosBtn" class="dashboard-btn">Procesamiento de Pagos</button>
                <button id="reportesBtn" class="dashboard-btn">Reportes</button>
            </div>

            <button id="logoutButton">Cerrar Sesión</button>
            <p>Aquí irá el contenido específico para cada rol más adelante.</p>
        </div>
    `;

    const logoutButton = containerElement.querySelector('#logoutButton');
    const dashboardUserNameElement = containerElement.querySelector('#dashboardUserName');

    // Referencias a todos los botones
    const gestionEmpleadosBtn = containerElement.querySelector('#gestionEmpleadosBtn');
    const gestionMenuBtn = containerElement.querySelector('#gestionMenuBtn');
    const gestionPedidosBtn = containerElement.querySelector('#gestionPedidosBtn');
    const estadosPedidosBtn = containerElement.querySelector('#estadosPedidosBtn'); // ¡Nueva referencia!
    const gestionCocinaBtn = containerElement.querySelector('#gestionCocinaBtn');
    const procesamientoPagosBtn = containerElement.querySelector('#procesamientoPagosBtn');
    const reportesBtn = containerElement.querySelector('#reportesBtn');

    dashboardUserNameElement.textContent = userName;

    // --- Lógica para mostrar/ocultar botones según el rol ---
    const ROL_ADMIN = 1;
    const ROL_MESERO = 2;
    const ROL_COCINERO = 3;
    const ROL_CLIENTE = 4;

    // Ocultar todos los botones por defecto
    gestionEmpleadosBtn.style.display = 'none';
    gestionMenuBtn.style.display = 'none';
    gestionPedidosBtn.style.display = 'none';
    estadosPedidosBtn.style.display = 'none'; // Por defecto oculto
    gestionCocinaBtn.style.display = 'none';
    procesamientoPagosBtn.style.display = 'none';
    reportesBtn.style.display = 'none';

    // Lógica de visibilidad según el rol
    if (parsedUserRole === ROL_ADMIN) {
        // Administrador ve todo
        gestionEmpleadosBtn.style.display = 'block';
        gestionMenuBtn.style.display = 'block';
        gestionPedidosBtn.style.display = 'block';
        estadosPedidosBtn.style.display = 'block';
        gestionCocinaBtn.style.display = 'block';
        procesamientoPagosBtn.style.display = 'block';
        reportesBtn.style.display = 'block';
    } else if (parsedUserRole === ROL_MESERO) {
        // Mesero: gestión de pedidos, estados de pedidos y procesamiento de pagos
        gestionPedidosBtn.style.display = 'block';
        estadosPedidosBtn.style.display = 'block';
        procesamientoPagosBtn.style.display = 'block';
    } else if (parsedUserRole === ROL_COCINERO) {
        // Cocinero: gestión de cocina, estados de pedidos y ver el menú
        gestionCocinaBtn.style.display = 'block';
        estadosPedidosBtn.style.display = 'block'; // Para ver los pedidos que debe preparar
        } else if (parsedUserRole === ROL_CLIENTE) {
        // Cliente: podría ver el estado de sus propios pedidos
        estadosPedidosBtn.style.display = 'block';
        // Podrías añadir un botón para "Hacer Pedido" aquí si el cliente puede iniciar pedidos
    }

    // --- Añadir event listeners a los botones ---
    gestionEmpleadosBtn.addEventListener('click', () => { window.router.navigate('/gestion-empleados/registrar'); /* window.router.navigate('/gestion-empleados'); */ });
    gestionMenuBtn.addEventListener('click', () => { console.log('Clic en Gestión de Menú'); /* window.router.navigate('/gestion-menu'); */ });
    gestionPedidosBtn.addEventListener('click', () => { console.log('Clic en Gestión de Pedidos'); /* window.router.navigate('/gestion-pedidos'); */ });
    estadosPedidosBtn.addEventListener('click', () => { console.log('Clic en Estados de Pedidos'); /* window.router.navigate('/estados-pedidos'); */ }); // ¡Nuevo Event Listener!
    gestionCocinaBtn.addEventListener('click', () => { console.log('Clic en Gestión de Cocina'); /* window.router.navigate('/gestion-cocina'); */ });
    procesamientoPagosBtn.addEventListener('click', () => { console.log('Clic en Procesamiento de Pagos'); /* window.router.navigate('/procesamiento-pagos'); */ });
    reportesBtn.addEventListener('click', () => { console.log('Clic en Reportes'); /* window.router.navigate('/reportes'); */ });

    // Event listener para cerrar sesión
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        window.router.navigate('/login');
    });
}