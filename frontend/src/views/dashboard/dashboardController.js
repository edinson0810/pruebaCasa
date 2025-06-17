// frontend/src/views/dashboard/dashboardController.js


export function setupDashboardLogic(containerElement) {
    const welcomeMessageElement = containerElement.querySelector('#welcomeMessage');
    const userNameElement = containerElement.querySelector('#userName');
    const userRoleElement = containerElement.querySelector('#userRole');
    const logoutButton = containerElement.querySelector('#logoutButton');

    // Mapeo de IDs de rol a nombres de rol legibles
    const roleMap = {
        '1': 'Administrador',
        '2': 'Mesero',
        '3': 'Cocinero',
        // Añade aquí cualquier otro rol que tengas
    };

    const userName = localStorage.getItem('userName') || 'Usuario';
    const userRoleId = localStorage.getItem('userRole'); // El rol del usuario logueado (string)

    // Mostrar el mensaje de bienvenida y el rol
    if (welcomeMessageElement) {
        welcomeMessageElement.textContent = `Bienvenido, ${userName}`;
    }
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    if (userRoleElement && userRoleId) {
        userRoleElement.textContent = roleMap[userRoleId] || 'Desconocido';
    } else if (userRoleElement) {
        userRoleElement.textContent = 'Desconocido';
    }

    // ** Lógica para mostrar/ocultar botones según el rol **
    const dashboardButtons = containerElement.querySelectorAll('.btn-dashboard'); // Selecciona todos los botones del dashboard

    dashboardButtons.forEach(button => {
        const allowedRolesAttr = button.dataset.rolesPermitidos; // Obtiene el valor del atributo data-allowed-roles

        if (allowedRolesAttr) {
            // Convierte la cadena "1,2,3" en un array de strings ["1", "2", "3"]
            const allowedRoles = allowedRolesAttr.split(',');

            // Verifica si el rol del usuario actual está incluido en los roles permitidos para este botón
            if (allowedRoles.includes(userRoleId)) {
                button.classList.remove('hidden'); // Muestra el botón si el rol está permitido
            } else {
                button.classList.add('hidden'); // Oculta el botón si el rol NO está permitido
            }
        } else {
            // Si un botón no tiene data-allowed-roles, por defecto lo mostramos (o puedes ocultarlo)
            button.classList.remove('hidden'); 
        }
    });

    // ** Lógica para el botón de Cerrar Sesión **
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userEmail');
            window.router.navigate('/login');
        });
    }

    // La navegación de los botones se sigue manejando con el 'onclick' directamente en el HTML
    // (ej. onclick="window.router.navigate('/gestion-empleados')"), lo cual está bien.
    // Si hubiéramos querido manejarlo todo en JS, tendríamos que haber añadido listeners aquí
    // para cada botón después de mostrarlos/ocultarlos.
}