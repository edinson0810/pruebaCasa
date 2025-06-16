/// frontend/src/pages/GestionEmpleadosPage.js


export async function GestionEmpleadosPage(containerElement) {
    const token = localStorage.getItem('token');

    // Redirección si no hay sesión iniciada
    if (!token) {
        window.router.navigate('/login');
        return;
    }

    try {
        // 1. Cargar el HTML de empleados
        const response = await fetch('/src/views/empleados/empleados.html');
        if (!response.ok) {
            throw new Error('No se pudo cargar la vista de empleados.');
        }
        const html = await response.text();
        containerElement.innerHTML = html;

        // 2. Importar y ejecutar el controlador
        const { setupEmpleadoController } = await import('/src/views/empleados/empleadosController.js');
        setupEmpleadoController(containerElement);

    } catch (error) {
        console.error('Error al cargar Gestión de Empleados:', error);
        containerElement.innerHTML = `<p class="error-message">Error al cargar la página de empleados.</p>`;
    }
}

  




