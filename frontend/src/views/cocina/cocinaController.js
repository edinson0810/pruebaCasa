// src/views/cocina/cocinaController.js

const API_BASE_URL = 'http://localhost:3000/api';

// Elementos del DOM (declarados globalmente pero asignados en setupCocinaController)
let pedidosPendientesContainer;
let pedidosEnPreparacionContainer;
let pedidosListosContainer;
let refreshPedidosBtn;
let volverDashboardBtn;

// Función de inicialización del controlador, llamada cuando la vista de cocina se carga.
export const setupCocinaController = () => {
    // console.log("-> setupCocinaController: Inicializando el módulo de cocina.");

    // *** PASO CRÍTICO: Asignación de elementos del DOM ***
    pedidosPendientesContainer = document.getElementById('pedidosPendientesContainer');
    pedidosEnPreparacionContainer = document.getElementById('pedidosEnPreparacionContainer');
    pedidosListosContainer = document.getElementById('pedidosListosContainer');
    refreshPedidosBtn = document.getElementById('refreshPedidosBtn');
    volverDashboardBtn = document.getElementById('volverDashboardBtnCocina');

    // *** VERIFICACIÓN DE ELEMENTOS CRÍTICOS ***
    if (!pedidosPendientesContainer || !pedidosEnPreparacionContainer || !pedidosListosContainer || !refreshPedidosBtn || !volverDashboardBtn) {
        console.error("ERROR CRÍTICO: Uno o más elementos esenciales de la vista de Cocina no se encontraron en el DOM.");
        console.error("Por favor, verifique que los IDs en 'src/views/cocina/index.html' sean correctos y que la página se cargue completamente.");
        return;
    }

    // Configuración de Event Listeners
    refreshPedidosBtn.addEventListener('click', fetchAndDisplayPedidos);
    pedidosPendientesContainer.addEventListener('click', handlePedidoAction);
    pedidosEnPreparacionContainer.addEventListener('click', handlePedidoAction);
    pedidosListosContainer.addEventListener('click', handlePedidoAction);

    volverDashboardBtn.addEventListener('click', () => {
        if (window.router && typeof window.router.navigate === 'function') {
            window.router.navigate('/dashboard');
        } else {
            console.warn("window.router.navigate no está disponible. Recargando la página al dashboard.");
            window.location.href = '/dashboard';
        }
    });

    fetchAndDisplayPedidos();
};

// Función de desmontaje del controlador
export const teardownCocinaController = () => {
    console.log("-> teardownCocinaController: Desmontando listeners del módulo de cocina.");
    if (refreshPedidosBtn) refreshPedidosBtn.removeEventListener('click', fetchAndDisplayPedidos);
    if (volverDashboardBtn && volverDashboardBtn.parentNode) {
        const oldBtn = volverDashboardBtn;
        volverDashboardBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(volverDashboardBtn, oldBtn);
    }
    if (pedidosPendientesContainer) pedidosPendientesContainer.removeEventListener('click', handlePedidoAction);
    if (pedidosEnPreparacionContainer) pedidosEnPreparacionContainer.removeEventListener('click', handlePedidoAction);
    if (pedidosListosContainer) pedidosListosContainer.removeEventListener('click', handlePedidoAction);

    pedidosPendientesContainer = null;
    pedidosEnPreparacionContainer = null;
    pedidosListosContainer = null;
    refreshPedidosBtn = null;
    volverDashboardBtn = null;
};

// =========================================================================
// Funciones de Lógica de Negocio
// =========================================================================

async function fetchAndDisplayPedidos() {
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos`);
        if (!response.ok) {
            throw new Error(`Error al cargar los pedidos: ${response.statusText}`);
        }
        const pedidos = await response.json();
        // console.log("Pedidos recibidos:", pedidos);
        renderPedidos(pedidos);
    } catch (error) {
        console.error('Error al obtener y mostrar pedidos:', error);
        alert('No se pudieron cargar los pedidos: ' + error.message);
    }
}

function renderPedidos(pedidos) {
    if (!pedidosPendientesContainer || !pedidosEnPreparacionContainer || !pedidosListosContainer) {
        console.error("Contenedores de pedidos no encontrados para renderizar. Esto debería haberse evitado en el setup.");
        return;
    }

    pedidosPendientesContainer.innerHTML = '';
    pedidosEnPreparacionContainer.innerHTML = '';
    pedidosListosContainer.innerHTML = '';

    const noPedidosMsg = (text) => `<p class="text-center text-secondary-emphasis">${text}</p>`;

    let hasPendientes = false;
    let hasEnPreparacion = false;
    let hasListos = false;

    pedidos.forEach(pedido => {
        const pedidoCard = createPedidoCard(pedido);
        if (pedido.estado === 'pendiente') {
            pedidosPendientesContainer.appendChild(pedidoCard);
            hasPendientes = true;
        } else if (pedido.estado === 'en_preparacion') {
            pedidosEnPreparacionContainer.appendChild(pedidoCard);
            hasEnPreparacion = true;
        } else if (pedido.estado === 'listo') {
            pedidosListosContainer.appendChild(pedidoCard);
            hasListos = true;
        }
    });

    if (!hasPendientes) pedidosPendientesContainer.innerHTML = noPedidosMsg('No hay pedidos pendientes.');
    if (!hasEnPreparacion) pedidosEnPreparacionContainer.innerHTML = noPedidosMsg('No hay pedidos en preparación.');
    if (!hasListos) pedidosListosContainer.innerHTML = noPedidosMsg('No hay pedidos listos.');
}

function createPedidoCard(pedido) {
    const card = document.createElement('div');
    card.classList.add('card', 'mb-2', 'pedido-card');
    card.dataset.pedidoId = pedido.id;

    let estadoClaseBoton = '';
    let textoBoton = '';
    let siguienteEstado = '';

    if (pedido.estado === 'pendiente') {
        estadoClaseBoton = 'btn-warning';
        textoBoton = 'Empezar Preparación';
        siguienteEstado = 'en_preparacion';
    } else if (pedido.estado === 'en_preparacion') {
        estadoClaseBoton = 'btn-primary';
        textoBoton = 'Marcar como Listo';
        siguienteEstado = 'listo';
    } else if (pedido.estado === 'listo') {
        estadoClaseBoton = 'btn-success';
        textoBoton = 'Marcar como Entregado';
        siguienteEstado = 'entregado';
    }

    // --- CORRECCIÓN AQUÍ: Asegúrate de que pedido.items sea un array antes de usar map ---
    const itemsHtml = (pedido.items || []).map(item => `
        <li>${item.cantidad} x ${item.menu_item_nombre || 'Producto Desconocido'} ($${parseFloat(item.precio_unitario || 0).toFixed(2)})</li>
    `).join('');

    card.innerHTML = `
        <div class="card-body bg-light text-dark">
            <h5 class="card-title">Pedido #${pedido.id} - Mesa: ${pedido.mesa_id}</h5>
            <p class="card-text">Usuario: ${pedido.usuario_id}</p>
            <ul class="list-unstyled small">
                ${itemsHtml}
            </ul>
            ${pedido.observaciones ? `<p class="card-text small"><strong>Obs:</strong> ${pedido.observaciones}</p>` : ''}
            <p class="card-text mt-2"><strong>Total:</strong> $${parseFloat(pedido.total).toFixed(2)}</p>
            <button class="btn ${estadoClaseBoton} btn-sm mt-2 update-status-btn"
                    data-pedido-id="${pedido.id}"
                    data-current-status="${pedido.estado}"
                    data-next-status="${siguienteEstado}">
                ${textoBoton}
            </button>
        </div>
    `;
    return card;
}

async function handlePedidoAction(event) {
    const target = event.target;
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

async function updatePedidoStatus(pedidoId, newStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: newStatus })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar el estado del pedido en el servidor.');
        }

        const result = await response.json();
        console.log(`Pedido ${pedidoId} actualizado a "${newStatus}":`, result.message);
        alert(`Pedido #${pedidoId} actualizado a "${newStatus.replace('_', ' ')}".`);
        fetchAndDisplayPedidos();
    } catch (error) {
        console.error('Error en el frontend al actualizar el estado del pedido:', error);
        alert(`Error al actualizar el estado del pedido: ${error.message}`);
    }
}