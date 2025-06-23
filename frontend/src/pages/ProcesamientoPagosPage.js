// frontend/src/pages/ProcesamientoPagosPage.js
// src/views/pages/ProcesamientoPagos.js
// Este archivo carga la vista y el controlador del panel de procesamiento de pagos.

export async function ProcesamientoPagosPage(containerElement) {
    if (!containerElement) {
        console.error("No se proporcionó un elemento contenedor para ProcesamientoPagosPage.");
        return;
    }

    try {
        // 1. Cargar el HTML del panel de pagos
        // Asegúrate de que la ruta sea '/src/views/pagos/index.html' (con 'pagos' en plural)
        const response = await fetch('/src/views/pagos/index.html');
        if (!response.ok) {
            throw new Error('No se pudo cargar la vista del panel de pagos.');
        }
        const html = await response.text();
        containerElement.innerHTML = html;

        // 2. Importar y ejecutar el controlador de pagos
        // Asegúrate de que la ruta sea '/src/views/pagos/pagoController.js'
        // Y que exporta 'setupPagoController'
        const { setupPagoController } = await import('/src/views/pagos/pagoController.js');
        setupPagoController(); // Llamamos a la función de inicialización del controlador

    } catch (error) {
        console.error('Error al cargar el Panel de Procesamiento de Pagos:', error);
        containerElement.innerHTML = `<p class="error-message">Error al cargar la página del panel de pagos.</p>`;
    }
}
