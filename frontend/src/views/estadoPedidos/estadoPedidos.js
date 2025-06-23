// src/views/estado-pedidos/estadoPedidosController.js
const API_BASE_URL = 'http://localhost:3000/api'; // Asegúrate de que esta URL base sea correcta

// Elementos del DOM (declarados globalmente pero asignados en setupEstadoPedidosController)
let pedidosListosContainer;
let refreshPedidosListosBtn;
let volverDashboardBtn;

// Función de inicialización del controlador, llamada cuando la vista de estado de pedidos se carga.
export const setupEstadoPedidosController = () => {
    // console.log("-> setupEstadoPedidosController: Inicializando el módulo de estado de pedidos.");

    // *** PASO CRÍTICO: Asignación de elementos del DOM ***
    pedidosListosContainer = document.getElementById('pedidosListosContainer');
    refreshPedidosListosBtn = document.getElementById('refreshPedidosListosBtn');
    volverDashboardBtn = document.getElementById('volverDashboardBtnEstado');

    // *** VERIFICACIÓN DE ELEMENTOS CRÍTICOS ***
    if (!pedidosListosContainer || !refreshPedidosListosBtn || !volverDashboardBtn) {
        console.error("ERROR CRÍTICO: Uno o más elementos esenciales de la vista de Estado de Pedidos no se encontraron en el DOM.");
        console.error("Por favor, verifique que los IDs en 'src/views/estado-pedidos/index.html' sean correctos y que la página se cargue completamente.");
        return; // Detener la ejecución si los elementos no se encuentran
    }

    // Configuración de Event Listeners
    refreshPedidosListosBtn.addEventListener('click', fetchAndDisplayPedidosListos);
    volverDashboardBtn.addEventListener('click', () => {
        // Asumiendo que tienes un sistema de ruteo frontend (como Page.js)
        if (window.router && typeof window.router.navigate === 'function') {
            window.router.navigate('/dashboard'); // Navegar al dashboard
        } else {
            console.warn("window.router.navigate no está disponible. Recargando la página al dashboard.");
            window.location.href = '/dashboard'; // Fallback si no hay router SPA
        }
    });

    fetchAndDisplayPedidosListos(); // Cargar los pedidos al iniciar la vista
};

// Función de desmontaje del controlador (para limpiar listeners si la vista se descarga)
export const teardownEstadoPedidosController = () => {
    console.log("-> teardownEstadoPedidosController: Desmontando listeners del módulo de estado de pedidos.");
    if (refreshPedidosListosBtn) refreshPedidosListosBtn.removeEventListener('click', fetchAndDisplayPedidosListos);
    // Para el botón de volver, una forma robusta de quitar el listener y asegurar que no haya duplicados
    if (volverDashboardBtn && volverDashboardBtn.parentNode) {
        const oldBtn = volverDashboardBtn;
        volverDashboardBtn = oldBtn.cloneNode(true); // Clona el nodo para eliminar todos los listeners
        oldBtn.parentNode.replaceChild(volverDashboardBtn, oldBtn); // Reemplaza el nodo antiguo por el clon
    }
    // Nulificar las referencias para liberar memoria
    pedidosListosContainer = null;
    refreshPedidosListosBtn = null;
    volverDashboardBtn = null;
};

// =========================================================================
// Funciones de Lógica de Negocio (Frontend)
// =========================================================================

async function fetchAndDisplayPedidosListos() {
    try {
        // Llama a la API del backend para obtener solo los pedidos con estado 'listo'
        // Esta URL DEBE COINCIDIR con la ruta GET que crearemos en el backend (ej. /api/pedidos/listos)
       const response = await fetch(`${API_BASE_URL}/detalles/listos`); //
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({})); // Intenta parsear el error del servidor
            const errorMessage = errorBody.message || response.statusText || 'Error desconocido';
            throw new Error(`Error al cargar los pedidos listos: ${errorMessage}`);
        }
        const pedidos = await response.json();
        // console.log("Pedidos listos recibidos:", pedidos); // Puedes descomentar para depurar
        renderPedidosListos(pedidos);
    } catch (error) {
        console.error('Error al obtener y mostrar pedidos listos:', error);
        alert('No se pudieron cargar los pedidos listos: ' + error.message);
    }
}

// Función para renderizar los pedidos en el contenedor
function renderPedidosListos(pedidos) {
    if (!pedidosListosContainer) {
        console.error("Contenedor de pedidos listos no encontrado para renderizar.");
        return;
    }

    pedidosListosContainer.innerHTML = ''; // Limpiar el contenido existente

    const noPedidosMsg = (text) => `<p class="text-center text-secondary-emphasis mt-3">${text}</p>`;

    if (pedidos.length === 0) {
        pedidosListosContainer.innerHTML = noPedidosMsg('No hay pedidos listos en este momento.');
    } else {
        pedidos.forEach(pedido => {
            // Asegurarse de que solo se rendericen pedidos con estado 'listo' (aunque la API ya filtra)
            if (pedido.estado === 'listo') {
                const pedidoCard = createPedidoListoCard(pedido);
                pedidosListosContainer.appendChild(pedidoCard);
            }
        });
        // Si después del filtro no hay listos, mostrar mensaje (por si acaso el filtro de la API falla)
        if (pedidosListosContainer.innerHTML === '') {
            pedidosListosContainer.innerHTML = noPedidosMsg('No hay pedidos listos en este momento.');
        }
    }
}

// Función para crear la tarjeta de un pedido listo (solo visualización, sin botones de acción)
function createPedidoListoCard(pedido) {
    const card = document.createElement('div');
    card.classList.add('card', 'mb-2', 'pedido-card', 'border-success'); // Clases de Bootstrap, borde verde
    card.dataset.pedidoId = pedido.pedido_id; // Guardar el ID del pedido en el dataset del elemento

    // Asegúrate de que pedido.items sea un array antes de usar map, para evitar errores
    const itemsHtml = (pedido.items || []).map(item => `
        <li>${item.cantidad} x ${item.menu_item_nombre || 'Producto Desconocido'} ($${parseFloat(item.precio_unitario || 0).toFixed(2)})</li>
    `).join('');

    card.innerHTML = `
        <div class="card-body bg-light text-dark">
            <h5 class="card-title text-success">Pedido #${pedido.pedido_id} - Mesa: ${pedido.mesa_id} <i class="fas fa-check"></i></h5>
            <p class="card-text">Usuario: ${pedido.usuario || 'Desconocido'}</p>
            <ul class="list-unstyled small">
                ${itemsHtml}
            </ul>
            ${pedido.observaciones ? `<p class="card-text small"><strong>Obs:</strong> ${pedido.observaciones}</p>` : ''}
            <p class="card-text mt-2"><strong>Total:</strong> $${parseFloat(pedido.total || 0).toFixed(2)}</p>
            <p class="text-success fw-bold mt-2">Estado: ${pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}</p>
        </div>
    `;
    return card;
}