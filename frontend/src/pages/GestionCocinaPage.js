// frontend/src/pages/GestionCocinaPage.js

export async function GestionCocinaPage(containerElement) {
   
    try {
        // 1. Cargar el HTML de empleados
        const response = await fetch('/src/views/cocina/index.html');
        if (!response.ok) {
            throw new Error('No se pudo cargar la vista de empleados.');
        }
        const html = await response.text();
        containerElement.innerHTML = html;

        // 2. Importar y ejecutar el controlador
        const { setupCocinaController } = await import('/src/views/cocina/cocinaController.js');
        setupCocinaController(containerElement);

    } catch (error) {
        console.error('Error al cargar Gestión de Cocina:', error);
        containerElement.innerHTML = `<p class="error-message">Error al cargar la página de empleados.</p>`;
    }
}