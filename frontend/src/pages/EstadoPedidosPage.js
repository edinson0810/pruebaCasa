// frontend/src/pages/EstadoPedidosPage.js

export async function EstadoPedidosPage(containerElement) {
   try {
        // 1. Cargar el HTML de empleados
        const response = await fetch('/src/views/estadoPedidos/index.html');
        if (!response.ok) {
            throw new Error('No se pudo cargar la vista de empleados.');
        }
        const html = await response.text();
        containerElement.innerHTML = html;

        // 2. Importar y ejecutar el controlador
        const { setupEstadoPedidosController } = await import('/src/views/estadoPedidos/estadoPedidos.js');
        setupEstadoPedidosController(containerElement);

    } catch (error) {
        console.error('Error al cargar Gestión de Estado de Pedido:', error);
        containerElement.innerHTML = `<p class="error-message">Error al cargar la página de estado de pedido.</p>`;
    }
}