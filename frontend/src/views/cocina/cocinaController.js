// src/views/cocina/cocinaController.js

// src/views/cocina/cocinaController.js

const API_BASE_URL = 'http://localhost:3000/api';

// Elementos del DOM (declarados aquí para ser accesibles globalmente dentro de este módulo)
// These will be assigned AFTER the HTML is loaded by GestionCocinaPage.js
let pedidosPendientesContainer;
let pedidosEnPreparacionContainer;
let pedidosListosContainer;
let refreshPedidosBtn;
let volverDashboardBtn; 

/**
 * Función de inicialización del controlador de Cocina.
 * Se llama cuando la vista de Cocina es cargada (por GestionCocinaPage.js).
 */
export const setupCocinaController = () => {
    // console.log("-> setupCocinaController: Inicializando módulo de cocina.");

    // 1. Asignación de elementos del DOM.
    // Es crucial que estos elementos existan en src/views/cocina/index.html
    pedidosPendientesContainer = document.getElementById('pedidosPendientesContainer');
    pedidosEnPreparacionContainer = document.getElementById('pedidosEnPreparacionContainer');
    pedidosListosContainer = document.getElementById('pedidosListosContainer');
    refreshPedidosBtn = document.getElementById('refreshPedidosBtn');
    volverDashboardBtn = document.getElementById('volverDashboardBtn');

    // **Verificación crítica de elementos DOM:**
    const criticalElements = {
        '#pedidosPendientesContainer': pedidosPendientesContainer,
        '#pedidosEnPreparacionContainer': pedidosEnPreparacionContainer,
        '#pedidosListosContainer': pedidosListosContainer,
        '#refreshPedidosBtn': refreshPedidosBtn,
        '#volverDashboardBtn': volverDashboardBtn
    };

    let missingElements = [];
    for (const id in criticalElements) {
        if (!criticalElements[id]) {
            missingElements.push(id);
        }
    }

    if (missingElements.length > 0) {
        console.error("ERROR CRÍTICO: No se pudieron encontrar los siguientes elementos DOM necesarios para la página de Cocina:");
        missingElements.forEach(id => console.error(` - ${id} (Verifique su src/views/cocina/index.html)`));
        // We won't inject an error message here, as GestionCocinaPage is responsible for DOM manipulation
        return; // Detiene la ejecución del controlador si faltan elementos críticos.
    }

    // 2. Configuración de Event Listeners
    if (refreshPedidosBtn) {
        refreshPedidosBtn.addEventListener('click', fetchAndDisplayPedidos);
    }
    if (volverDashboardBtn) {
        volverDashboardBtn.addEventListener('click', () => {
            if (window.router && typeof window.router.navigate === 'function') {
                window.router.navigate('/dashboard');
            } else {
                console.error("window.router.navigate no está definido. ¿Está el enrutador cargado correctamente?");
                window.location.href = '/dashboard'; // Fallback
            }
        });
    }

    // Delegación de eventos para los botones de cambio de estado de los pedidos
    pedidosPendientesContainer.addEventListener('click', handlePedidoAction);
    pedidosEnPreparacionContainer.addEventListener('click', handlePedidoAction);
    pedidosListosContainer.addEventListener('click', handlePedidoAction);

    // 3. Cargar pedidos al iniciar la vista
    fetchAndDisplayPedidos();

    // Opcional: Auto-actualizar pedidos cada cierto tiempo (ej. cada 30 segundos)
    // setInterval(fetchAndDisplayPedidos, 30000); 

    // console.log("-> setupCocinaController: Módulo de cocina inicializado correctamente.");
};

/**
 * Función de limpieza (teardown) del controlador de Cocina.
 * Se llama cuando el enrutador abandona esta vista para liberar recursos.
 */
export const teardownCocinaController = () => {
    console.log("-> teardownCocinaController: Desmontando listeners del módulo de cocina.");
    
    if (refreshPedidosBtn) refreshPedidosBtn.removeEventListener('click', fetchAndDisplayPedidos);
    if (volverDashboardBtn) {
        const clonedBtn = volverDashboardBtn.cloneNode(true);
        volverDashboardBtn.parentNode.replaceChild(clonedBtn, volverDashboardBtn);
        volverDashboardBtn = clonedBtn; 
    }
    if (pedidosPendientesContainer) pedidosPendientesContainer.removeEventListener('click', handlePedidoAction);
    if (pedidosEnPreparacionContainer) pedidosEnPreparacionContainer.removeEventListener('click', handlePedidoAction);
    if (pedidosListosContainer) pedidosListosContainer.removeEventListener('click', handlePedidoAction);

    // Limpiar referencias a los elementos del DOM para ayudar al Garbage Collector
    pedidosPendientesContainer = null;
    pedidosEnPreparacionContainer = null;
    pedidosListosContainer = null;
    refreshPedidosBtn = null;
    volverDashboardBtn = null;
};


// =========================================================================
// Funciones de Lógica de Negocio (Estas funciones son internas al controlador)
// =========================================================================

async function fetchAndDisplayPedidos() {
    // console.log("Obteniendo y mostrando todos los pedidos...");
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos`); 
        if (!response.ok) {
            throw new Error(`Error al cargar los pedidos: ${response.statusText}`);
        }
        const pedidos = await response.json();
        console.log("Pedidos recibidos:", pedidos);
        renderPedidos(pedidos); 
    } catch (error) {
        console.error('Error al obtener y mostrar pedidos:', error);
        alert('No se pudieron cargar los pedidos: ' + error.message);
    }
}

function renderPedidos(pedidos) {
    if (!pedidosPendientesContainer || !pedidosEnPreparacionContainer || !pedidosListosContainer) {
        console.error("Contenedores de pedidos no encontrados para renderizar en renderPedidos().");
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
        estadoClaseBoton = 'btn-primary';
        textoBoton = 'Empezar Preparación';
        siguienteEstado = 'en_preparacion';
    } else if (pedido.estado === 'en_preparacion') {
        estadoClaseBoton = 'btn-success';
        textoBoton = 'Marcar como Listo';
        siguienteEstado = 'listo';
    } else if (pedido.estado === 'listo') {
        estadoClaseBoton = 'btn-secondary'; 
        textoBoton = 'Entregado (Opcional)'; 
        siguienteEstado = 'entregado'; 
    }

    const itemsHtml = pedido.items.map(item => `
        <li>${item.cantidad} x ${item.menu_item_nombre || 'Producto Desconocido'} ($${parseFloat(item.precio_unitario || 0).toFixed(2)})</li>
    `).join('');

    card.innerHTML = `
        <div class="card-body bg-light text-dark">
            <h5 class="card-title">Pedido #${pedido.id} - Mesa: ${pedido.mesa_id}</h5>
            <p class="card-text">Usuario: ${pedido.usuario_id}</p>
            <ul class="list-unstyled">
                ${itemsHtml}
            </ul>
            ${pedido.observaciones ? `<p class="card-text"><strong>Obs:</strong> ${pedido.observaciones}</p>` : ''}
            <p class="card-text"><strong>Total:</strong> $${parseFloat(pedido.total).toFixed(2)}</p>
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
        const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}/estado`, {
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