// frontend/src/controllers/pedidoController.js
// frontend/views/pedidos/pedidosController.js
// frontend/views/pedidos/pedidosController.js

// Variables DOM
let pedidoIdInput;
let usuarioInput; // Campo para ID Mesero
let mesaInput;
let estadoSelect;
let itemsContainer;
let addItemBtn;
let pedidoForm;
let resetPedidoBtn;
let volverDashboardBtn;

// Variables para las otras secciones del HTML (si existen y están descomentadas en tu index.html)
let pedidosTableBody; // Para la tabla de lista de pedidos
let pedidoDetailsModalElement; // Para el modal de detalles del pedido

// Variable para almacenar todos los productos del menú
let allMenuItems = [];

/**
 * Obtiene el ID del usuario logueado de localStorage.
 * ADAPTA esta función a cómo tu aplicación maneja la sesión del usuario.
 * @returns {number|null} El ID del usuario o null si no hay ninguno.
 */
function getLoggedInUserId() {
    const userId = localStorage.getItem('loggedInUserId'); // Asume que guardas el ID aquí
    return userId ? parseInt(userId) : null;
}

/**
 * Carga todos los productos del menú desde la API.
 */
async function loadAllMenuItems() {
    try {
        const response = await fetch('http://localhost:3000/api/menu'); // ¡Asegúrate que esta URL sea correcta!
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allMenuItems = await response.json();
        console.log('Menú cargado:', allMenuItems);
    } catch (error) {
        console.error('Error al cargar el menú:', error);
        // Considera un mensaje más amigable al usuario en la UI si la carga falla
    }
}

/**
 * Añade una nueva fila para un producto al formulario de pedido.
 * Si se proporciona un 'item', precarga los datos para edición.
 * @param {Object} [item=null] - Objeto de ítem de pedido para precargar datos (en caso de edición).
 */
function addItemToPedidoForm(item = null) {
    const itemIndex = itemsContainer.children.length; // Usa la cantidad de hijos para un índice único

    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.setAttribute('data-item-index', itemIndex);

    // Genera las opciones del select dinámicamente con los productos cargados
    const menuOptions = allMenuItems.map(product =>
        `<option value="${product.id}" data-price="${product.precio}">${product.nombre}</option>`
    ).join('');

    itemRow.innerHTML = `
        <div class="mb-3">
            <label for="menuItem${itemIndex}" class="form-label visually-hidden">Producto</label>
            <select class="form-select menuItem" id="menuItem${itemIndex}" data-index="${itemIndex}" required>
                <option value="">Seleccione un producto</option>
                ${menuOptions}
            </select>
        </div>
        <div class="mb-3">
            <label for="cantidadItem${itemIndex}" class="form-label visually-hidden">Cantidad</label>
            <input type="number" class="form-control cantidadItem" id="cantidadItem${itemIndex}" data-index="${itemIndex}" value="${item ? item.cantidad : 1}" min="1" required>
        </div>
        <div class="mb-3">
            <label for="precioUnitarioItem${itemIndex}" class="form-label visually-hidden">Precio Unitario</label>
            <input type="text" class="form-control precioUnitarioItem" id="precioUnitarioItem${itemIndex}" data-index="${itemIndex}" value="${item ? parseFloat(item.precio_unitario || 0).toFixed(2) : ''}" readonly placeholder="Precio">
        </div>
        <div class="mb-3">
            <button type="button" class="removeItemBtn">X</button>
        </div>
    `;

    itemsContainer.appendChild(itemRow);

    // Event listener para auto-rellenar el precio unitario
    const menuItemSelect = itemRow.querySelector(`#menuItem${itemIndex}`);
    if (menuItemSelect) {
        menuItemSelect.addEventListener('change', (event) => {
            const selectedOption = event.target.options[event.target.selectedIndex];
            const price = selectedOption.getAttribute('data-price');
            const precioUnitarioInput = itemRow.querySelector(`#precioUnitarioItem${itemIndex}`);
            if (precioUnitarioInput) {
                precioUnitarioInput.value = parseFloat(price || 0).toFixed(2);
            }
        });

        // Si se están precargando datos (modo edición), selecciona el producto y actualiza el precio
        if (item && item.menu_id) {
            menuItemSelect.value = item.menu_id;
            // Disparar el evento 'change' manualmente para que el precio unitario se refleje
            const event = new Event('change');
            menuItemSelect.dispatchEvent(event);
        }
    }

    // Event listener para eliminar la fila
    const removeItemButton = itemRow.querySelector('.removeItemBtn');
    if (removeItemButton) {
        removeItemButton.addEventListener('click', () => {
            itemRow.remove();
            updateRemoveButtonsVisibility(); // Ajusta la visibilidad del botón 'X'
        });
    }

    updateRemoveButtonsVisibility(); // Asegura que el botón 'X' se muestre/oculte correctamente
}

/**
 * Controla la visibilidad del botón para eliminar ítems (oculto si solo hay uno).
 */
function updateRemoveButtonsVisibility() {
    const removeButtons = itemsContainer.querySelectorAll('.removeItemBtn');
    if (removeButtons.length <= 1) {
        removeButtons.forEach(btn => btn.style.display = 'none');
    } else {
        removeButtons.forEach(btn => btn.style.display = 'inline-block'); // O 'block' dependiendo de tu CSS
    }
}

/**
 * Resetea el formulario de pedido a su estado inicial.
 */
function resetForm() {
    pedidoIdInput.value = '';
    const loggedInUserId = getLoggedInUserId();
    if (loggedInUserId) {
        usuarioInput.value = loggedInUserId;
        usuarioInput.readOnly = true;
    } else {
        usuarioInput.value = '';
        usuarioInput.readOnly = false;
    }
    mesaInput.value = '';
    estadoSelect.value = 'pendiente';
    itemsContainer.innerHTML = ''; // Limpia todos los productos
    addItemToPedidoForm(); // Añade una fila de producto vacía
}

/**
 * Guarda un nuevo pedido o actualiza uno existente.
 * @param {Event} event - El evento de submit del formulario.
 */
async function savePedido(event) {
    event.preventDefault();

    const pedidoId = pedidoIdInput.value;
    const usuario_id = parseInt(usuarioInput.value);
    const mesa_id = parseInt(mesaInput.value);
    const estado = estadoSelect.value;

    const items = [];
    itemsContainer.querySelectorAll('.item-row').forEach(row => {
        const menuId = parseInt(row.querySelector('.menuItem').value);
        const cantidad = parseInt(row.querySelector('.cantidadItem').value);
        const precioUnitario = parseFloat(row.querySelector('.precioUnitarioItem').value);

        if (menuId && cantidad && precioUnitario) {
            items.push({
                menu_id: menuId,
                cantidad: cantidad,
                precio_unitario: precioUnitario
            });
        }
    });

    if (!usuario_id || !mesa_id || items.length === 0) {
        alert('Por favor, complete todos los campos de mesero, mesa y añada al menos un producto con sus datos.');
        return;
    }

    const pedidoData = {
        usuario_id,
        mesa_id,
        estado,
        items
    };

    const url = pedidoId ? `http://localhost:3000/api/pedidos/${pedidoId}` : 'http://localhost:3000/api/pedidos';
    const method = pedidoId ? 'PUT' : 'POST';

    console.log('Enviando pedido:', pedidoData);

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pedidoData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message);
        loadPedidos(); // Recargar la tabla de pedidos si está presente en el DOM
        resetForm(); // Limpiar el formulario para un nuevo pedido
    } catch (error) {
        console.error('Error al guardar el pedido:', error);
        alert(`Error al guardar el pedido: ${error.message}`);
    }
}

/**
 * Carga y muestra los pedidos en la tabla (solo si la tabla está presente en el DOM).
 */
async function loadPedidos() {
    if (!pedidosTableBody) {
        console.warn('pedidosTableBody no encontrado. La tabla de pedidos no será cargada.');
        return;
    }
    try {
        const response = await fetch('http://localhost:3000/api/pedidos');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const pedidos = await response.json();
        pedidosTableBody.innerHTML = ''; // Limpiar tabla

        pedidos.forEach(pedido => {
            const row = document.createElement('tr');
            const totalMostrado = parseFloat(pedido.total || 0).toFixed(2);

            row.innerHTML = `
                <td>${pedido.id}</td>
                <td>${pedido.nombre_mesero || 'N/A'}</td>
                <td>${pedido.mesa_id}</td>
                <td>${new Date(pedido.fecha_pedido).toLocaleString()}</td>
                <td>${pedido.estado}</td>
                <td>$${totalMostrado}</td>
                <td class="action-buttons">
                    <button class="view-details-btn" data-id="${pedido.id}">Ver</button>
                    <button class="edit-pedido-btn" data-id="${pedido.id}">Editar</button>
                    <button class="delete-pedido-btn" data-id="${pedido.id}">Eliminar</button>
                </td>
            `;
            pedidosTableBody.appendChild(row);
        });

        attachTableEventListeners();
    } catch (error) {
        console.error('Error al cargar los pedidos:', error);
    }
}

/**
 * Adjunta los event listeners a los botones de acción de la tabla de pedidos.
 */
function attachTableEventListeners() {
    document.querySelectorAll('.view-details-btn').forEach(button => {
        button.onclick = (e) => viewPedidoDetails(e.target.dataset.id);
    });
    document.querySelectorAll('.edit-pedido-btn').forEach(button => {
        button.onclick = (e) => editPedido(e.target.dataset.id);
    });
    document.querySelectorAll('.delete-pedido-btn').forEach(button => {
        button.onclick = (e) => deletePedido(e.target.dataset.id);
    });
}

/**
 * Muestra los detalles de un pedido en un modal (si el modal está presente en el DOM).
 * @param {string} id - El ID del pedido a mostrar.
 */
async function viewPedidoDetails(id) {
    if (!pedidoDetailsModalElement) {
        console.warn('El elemento del modal de detalles no fue encontrado. No se pueden mostrar los detalles.');
        return;
    }
    try {
        const response = await fetch(`http://localhost:3000/api/pedidos/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const pedido = await response.json();

        document.getElementById('modalPedidoId').textContent = pedido.id;
        document.getElementById('modalMesero').textContent = pedido.nombre_mesero || 'N/A';
        document.getElementById('modalMesa').textContent = pedido.mesa_id;
        document.getElementById('modalFecha').textContent = new Date(pedido.fecha_pedido).toLocaleString();
        document.getElementById('modalEstado').textContent = pedido.estado;
        document.getElementById('modalTotal').textContent = parseFloat(pedido.total || 0).toFixed(2);

        const modalProductosList = document.getElementById('modalProductosList');
        modalProductosList.innerHTML = '';
        if (pedido.items && Array.isArray(pedido.items)) {
            pedido.items.forEach(item => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                const itemPrecio = parseFloat(item.precio_unitario || 0).toFixed(2);
                li.textContent = `${item.cantidad} x ${item.nombre_producto} ($${itemPrecio} c/u)`;
                modalProductosList.appendChild(li);
            });
        }

        // Mostrar el modal (gestión manual si no usas Bootstrap JS)
        pedidoDetailsModalElement.style.display = 'block';
        pedidoDetailsModalElement.style.backgroundColor = 'rgba(0,0,0,0.5)';

        const closeButton = pedidoDetailsModalElement.querySelector('.btn-close') || pedidoDetailsModalElement.querySelector('.modal-footer .btn-secondary');
        if (closeButton) {
            closeButton.onclick = () => {
                pedidoDetailsModalElement.style.display = 'none';
            };
        }
    } catch (error) {
        console.error('Error al cargar los detalles del pedido:', error);
        alert('No se pudieron cargar los detalles del pedido.');
    }
}

/**
 * Carga los datos de un pedido en el formulario para su edición.
 * @param {string} id - El ID del pedido a editar.
 */
async function editPedido(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/pedidos/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const pedido = await response.json();

        pedidoIdInput.value = pedido.id;
        usuarioInput.value = pedido.usuario_id;
        mesaInput.value = pedido.mesa_id;
        estadoSelect.value = pedido.estado;

        itemsContainer.innerHTML = ''; // Limpiar ítems existentes
        if (pedido.items && Array.isArray(pedido.items) && pedido.items.length > 0) {
            pedido.items.forEach(item => addItemToPedidoForm(item));
        } else {
            addItemToPedidoForm(); // Si no hay ítems, añadir uno vacío
        }

        // Desplazarse al formulario
        pedidoForm.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Error al cargar pedido para edición:', error);
        alert('No se pudo cargar el pedido para edición.');
    }
}

/**
 * Elimina un pedido de la base de datos.
 * @param {string} id - El ID del pedido a eliminar.
 */
async function deletePedido(id) {
    if (!confirm('¿Está seguro de que desea eliminar este pedido?')) {
        return;
    }
    try {
        const response = await fetch(`http://localhost:3000/api/pedidos/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        alert('Pedido eliminado correctamente.');
        loadPedidos(); // Recargar la tabla
    } catch (error) {
        console.error('Error al eliminar el pedido:', error);
        alert(`Error al eliminar el pedido: ${error.message}`);
    }
}


/**
 * Función principal para inicializar el controlador de pedidos.
 * Debe llamarse cuando la vista de pedidos se carga en el DOM.
 * @param {HTMLElement} container - El elemento contenedor principal de la vista de pedidos.
 */
export async function setupPedidoController(container) {
    console.log('Inicializando PedidoController...');

    // Asignar elementos DOM
    pedidoIdInput = container.querySelector('#pedidoId');
    usuarioInput = container.querySelector('#usuario');
    mesaInput = container.querySelector('#mesa');
    estadoSelect = container.querySelector('#estado');
    itemsContainer = container.querySelector('#itemsContainer');
    addItemBtn = container.querySelector('#addItemBtn');
    pedidoForm = container.querySelector('#pedidoForm');
    resetPedidoBtn = container.querySelector('#resetPedidoBtn');
    volverDashboardBtn = container.querySelector('#volverDashboardBtn');

    // Asignar elementos de las otras secciones (si están descomentadas en tu HTML)
    pedidosTableBody = container.querySelector('#pedidosTableBody');
    pedidoDetailsModalElement = container.querySelector('#pedidoDetailsModal');

    // Validar que los elementos esenciales para el formulario existen
    if (!pedidoIdInput || !usuarioInput || !mesaInput || !estadoSelect || !itemsContainer || !addItemBtn || !pedidoForm || !resetPedidoBtn || !volverDashboardBtn) {
        console.error('ERROR: No se encontraron todos los elementos HTML necesarios para el formulario de toma de pedido.');
        return;
    }

    // Lógica para auto-rellenar el ID del Mesero
    const loggedInUserId = getLoggedInUserId();
    if (loggedInUserId) {
        usuarioInput.value = loggedInUserId;
        usuarioInput.readOnly = true;
    } else {
        console.warn('No se detectó un usuario logueado. El campo "ID Mesero" está editable.');
        usuarioInput.readOnly = false;
    }

    // Cargar los productos del menú (esto es asíncrono y debe completarse antes de manipular los selects de productos)
    await loadAllMenuItems();

    // Rellenar las opciones del select inicial que ya está en el HTML
    const initialMenuItemSelect = itemsContainer.querySelector('#menuItem0');
    if (initialMenuItemSelect) {
        initialMenuItemSelect.innerHTML = '<option value="">Seleccione un producto</option>' +
                                        allMenuItems.map(product => `<option value="${product.id}" data-price="${product.precio}">${product.nombre}</option>`).join('');
        // También adjuntar el event listener para el select inicial
        initialMenuItemSelect.addEventListener('change', (event) => {
            const selectedOption = event.target.options[event.target.selectedIndex];
            const price = selectedOption.getAttribute('data-price');
            const precioUnitarioInput = initialMenuItemSelect.closest('.item-row').querySelector('.precioUnitarioItem');
            if (precioUnitarioInput) {
                precioUnitarioInput.value = parseFloat(price || 0).toFixed(2);
            }
        });
        updateRemoveButtonsVisibility(); // Asegura el estado inicial del botón 'X'
    } else {
        // Si por alguna razón el primer item-row no estaba en el HTML, lo añade.
        // Esto sería un fallback, lo ideal es que el HTML ya lo incluya.
        addItemToPedidoForm();
    }


    // Adjuntar Event Listeners
    addItemBtn.addEventListener('click', () => addItemToPedidoForm());
    pedidoForm.addEventListener('submit', savePedido);
    resetPedidoBtn.addEventListener('click', resetForm);
    volverDashboardBtn.addEventListener('click', () => window.location.hash = '#/dashboard');

    // Cargar los pedidos existentes en la tabla al inicio (solo si la tabla está presente)
    if (pedidosTableBody) {
        loadPedidos();
    }
}