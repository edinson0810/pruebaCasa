// src/views/cocina/cocinaController.js
const API_BASE_URL = 'http://localhost:3000/api';

// Elementos del DOM (declarados globalmente pero asignados en setupCocinaController)
let pedidosPendientesContainer;
let refreshPedidosBtn;
let volverDashboardBtn;

// Función de inicialización del controlador, llamada cuando la vista de cocina se carga.
export const setupCocinaController = () => {
    // console.log("-> setupCocinaController: Inicializando el módulo de cocina.");

    // *** PASO CRÍTICO: Asignación de elementos del DOM ***
    pedidosPendientesContainer = document.getElementById('pedidosPendientesContainer');
    refreshPedidosBtn = document.getElementById('refreshPedidosBtn');
    volverDashboardBtn = document.getElementById('volverDashboardBtnCocina');

    // *** VERIFICACIÓN DE ELEMENTOS CRÍTICOS ***
    // Solo verificar el contenedor de pendientes y los botones
    if (!pedidosPendientesContainer || !refreshPedidosBtn || !volverDashboardBtn) {
        console.error("ERROR CRÍTICO: Uno o más elementos esenciales de la vista de Cocina no se encontraron en el DOM.");
        console.error("Por favor, verifique que los IDs en 'src/views/cocina/index.html' sean correctos y que la página se cargue completamente.");
        return;
    }

    // Configuración de Event Listeners
    refreshPedidosBtn.addEventListener('click', fetchAndDisplayPedidos);
    pedidosPendientesContainer.addEventListener('click', handlePedidoAction);

    volverDashboardBtn.addEventListener('click', () => {
        if (window.router && typeof window.router.navigate === 'function') {
            window.router.navigate('/dashboard');
        } else {
            console.warn("window.router.navigate no está disponible. Recargando la página al dashboard.");
            window.location.href = '/dashboard';
        }
    });

    fetchAndDisplayPedidos(); // Cargar los pedidos al iniciar la vista
};

// Función de desmontaje del controlador (para limpiar listeners si la vista se descarga)
export const teardownCocinaController = () => {
    console.log("-> teardownCocinaController: Desmontando listeners del módulo de cocina.");
    if (refreshPedidosBtn) refreshPedidosBtn.removeEventListener('click', fetchAndDisplayPedidos);
    // Para el botón de volver, una forma robusta de quitar el listener y asegurar que no haya duplicados
    if (volverDashboardBtn && volverDashboardBtn.parentNode) {
        const oldBtn = volverDashboardBtn;
        volverDashboardBtn = oldBtn.cloneNode(true); // Clona el nodo para eliminar todos los listeners
        oldBtn.parentNode.replaceChild(volverDashboardBtn, oldBtn); // Reemplaza el nodo antiguo por el clon
    }
    if (pedidosPendientesContainer) pedidosPendientesContainer.removeEventListener('click', handlePedidoAction);

    // Nulificar las referencias para liberar memoria
    pedidosPendientesContainer = null;
    refreshPedidosBtn = null;
    volverDashboardBtn = null;
};

// =========================================================================
// Funciones de Lógica de Negocio (Frontend)
// =========================================================================

async function fetchAndDisplayPedidos() {
    try {
        // Llama a la API del backend para obtener solo los pedidos pendientes de cocina
        // Esta URL DEBE COINCIDIR con la ruta GET en src/routes/cocinaRoutes.js
        const response = await fetch(`${API_BASE_URL}/cocina/pendientes-cocina`);
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({})); // Intenta parsear el error del servidor
            const errorMessage = errorBody.message || response.statusText || 'Error desconocido';
            throw new Error(`Error al cargar los pedidos: ${errorMessage}`);
        }
        const pedidos = await response.json();
        // console.log("Pedidos recibidos:", pedidos); // Puedes descomentar para depurar
        renderPedidos(pedidos); // Renderizar los pedidos en la única columna
    } catch (error) {
        console.error('Error al obtener y mostrar pedidos pendientes:', error);
        alert('No se pudieron cargar los pedidos: ' + error.message);
    }
}

// Función para renderizar los pedidos en la única columna
function renderPedidos(pedidos) {
    if (!pedidosPendientesContainer) {
        console.error("Contenedor de pedidos pendientes no encontrado para renderizar.");
        return;
    }

    pedidosPendientesContainer.innerHTML = ''; // Limpiar el contenido existente

    const noPedidosMsg = (text) => `<p class="text-center text-secondary-emphasis mt-3">${text}</p>`;

    if (pedidos.length === 0) {
        pedidosPendientesContainer.innerHTML = noPedidosMsg('No hay pedidos pendientes.');
    } else {
        pedidos.forEach(pedido => {
            // Asegurarse de que solo se rendericen pedidos pendientes
            if (pedido.estado === 'pendiente') {
                const pedidoCard = createPedidoCard(pedido);
                pedidosPendientesContainer.appendChild(pedidoCard);
            }
        });
        // Si después del filtro no hay pendientes (por si acaso), mostrar mensaje
        if (pedidosPendientesContainer.innerHTML === '') {
            pedidosPendientesContainer.innerHTML = noPedidosMsg('No hay pedidos pendientes.');
        }
    }
}

// Función para crear la tarjeta de un pedido
function createPedidoCard(pedido) {
    const card = document.createElement('div');
    card.classList.add('card', 'mb-2', 'pedido-card'); // Clases de Bootstrap
    card.dataset.pedidoId = pedido.pedido_id; // Guardar el ID del pedido en el dataset del elemento

    // Lógica del botón: solo para pedidos pendientes, el botón marcará como "listo"
    let estadoClaseBoton = 'btn-primary'; // Botón azul primario (Bootstrap)
    let textoBoton = 'Marcar como Listo';
    let siguienteEstado = 'listo';

    // Asegúrate de que pedido.items sea un array antes de usar map, para evitar errores
    const itemsHtml = (pedido.items || []).map(item => `
        <li>${item.cantidad} x ${item.menu_item_nombre || 'Producto Desconocido'} ($${parseFloat(item.precio_unitario || 0).toFixed(2)})</li>
    `).join('');

    card.innerHTML = `
        <div class="card-body bg-light text-dark">
            <h5 class="card-title">Pedido #${pedido.pedido_id} - Mesa: ${pedido.mesa_id}</h5>
            <p class="card-text">Usuario: ${pedido.usuario || 'Desconocido'}</p>
            <ul class="list-unstyled small">
                ${itemsHtml}
            </ul>
            ${pedido.observaciones ? `<p class="card-text small"><strong>Obs:</strong> ${pedido.observaciones}</p>` : ''}
            <p class="card-text mt-2"><strong>Total:</strong> $${parseFloat(pedido.total || 0).toFixed(2)}</p>
            ${pedido.estado === 'pendiente' ? `
                <button class="btn ${estadoClaseBoton} btn-sm mt-2 update-status-btn"
                        data-pedido-id="${pedido.pedido_id}"
                        data-current-status="${pedido.estado}"
                        data-next-status="${siguienteEstado}">
                    ${textoBoton}
                </button>
            ` : `<p class="text-secondary mt-2">Estado: ${pedido.estado.replace('_', ' ').charAt(0).toUpperCase() + pedido.estado.replace('_', ' ').slice(1)}</p>`}
        </div>
    `;
    return card;
}

// Manejador de eventos para las acciones de los pedidos (solo actualizar estado)
async function handlePedidoAction(event) {
    const target = event.target;
    // Solo actuamos si se hizo clic en un botón con la clase 'update-status-btn'
    if (target.classList.contains('update-status-btn')) {
        const pedidoId = target.dataset.pedidoId;
        const currentStatus = target.dataset.currentStatus;
        const nextStatus = target.dataset.nextStatus;

        if (!pedidoId || !nextStatus) {
            console.error("Datos incompletos para actualizar el pedido:", { pedidoId, nextStatus });
            alert("Error: No se pudo procesar la acción del pedido.");
            return;
        }

        console.log(`Intentando actualizar pedido ${pedidoId} de "${currentStatus}" a "${nextStatus}"`);
        await updatePedidoStatus(pedidoId, nextStatus);
    }
}

// Función para enviar la actualización del estado del pedido al backend
async function updatePedidoStatus(pedidoId, newStatus) {
    try {
        // La URL de la API DEBE COINCIDIR con la ruta PUT en src/routes/cocinaRoutes.js
        const response = await fetch(`${API_BASE_URL}/cocina/${pedidoId}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: newStatus })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al actualizar el estado del pedido en el servidor.');
        }

        const result = await response.json();
        // console.log(`Pedido ${pedidoId} actualizado a "${newStatus}":`, result.message);
        alert(`Pedido #${pedidoId} actualizado a "${newStatus.replace('_', ' ')}".`);
        fetchAndDisplayPedidos(); // Refrescar la lista de pedidos pendientes después de la actualización
    } catch (error) {
        console.error('Error en el frontend al actualizar el estado del pedido:', error);
        alert(`Error al actualizar el estado del pedido: ${error.message}`);
    }
}