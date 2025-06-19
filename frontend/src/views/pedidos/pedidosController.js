// frontend/src/controllers/pedidoController.js
// frontend/views/pedidos/pedidosController.js

// Variables DOM
let pedidoIdInput; // Campo oculto para el ID del pedido
let usuarioInput; // Campo para ID Mesero
let mesaSelect;   // Selector de mesas
let itemsContainer; // Contenedor de ítems de producto
let addItemBtn;     // Botón para añadir producto
let pedidoForm;     // El formulario completo

// Nuevos botones de acción específicos
let guardarPedidoBtn;
let eliminarPedidoBtn;
let editarPedidoBtn; // Este botón ahora se usará para mostrar el campo de ID para edición
let limpiarFormularioBtn;
let volverDashboardBtn;

// Elementos para cargar/eliminar un pedido por ID
let pedidoIdToManageInput;
let loadPedidoForEditBtn;
let editDeleteIdContainer;

// Variables para las otras secciones del HTML (si existen descomentadas en tu index.html)
let pedidosTableBody; // Para la tabla de lista de pedidos (actualmente no en HTML simplificado)
let pedidoDetailsModalElement; // Para el modal de detalles del pedido (actualmente no en HTML simplificado)

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
        // console.log('Menú cargado:', allMenuItems);
    } catch (error) {
        console.error('Error al cargar el menú:', error);
        // Si la carga falla, asegúrate de que el usuario vea un mensaje
        alert('Error al cargar los productos del menú. Por favor, intente de nuevo más tarde.');
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
            // Asegura que el precio se obtenga correctamente, incluso si no está definido
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
            // Esto es crucial para que el precio aparezca automáticamente al cargar un pedido para edición
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
    pedidoIdInput.value = ''; // Limpia el ID del pedido oculto
    const loggedInUserId = getLoggedInUserId();
    if (loggedInUserId) {
        usuarioInput.value = loggedInUserId;
        usuarioInput.readOnly = true;
    } else {
        usuarioInput.value = '';
        usuarioInput.readOnly = false;
    }
    mesaSelect.value = ''; // Limpia la selección de mesa
    itemsContainer.innerHTML = ''; // Limpia todos los productos
    addItemToPedidoForm(); // Añade una fila de producto vacía
    editDeleteIdContainer.style.display = 'none'; // Oculta el campo para ID de gestión
    pedidoIdToManageInput.value = ''; // Limpia el campo de ID a gestionar
}

/**
 * Guarda un nuevo pedido o actualiza uno existente.
 * @param {Event} event - El evento de submit del formulario.
 */
async function savePedido(event) {
    event.preventDefault();

    const pedidoId = pedidoIdInput.value;
    const usuario_id = parseInt(usuarioInput.value);
    const mesa_id = parseInt(mesaSelect.value); // Obtener el ID de la mesa del select

    const items = [];
    itemsContainer.querySelectorAll('.item-row').forEach(row => {
        const menuSelect = row.querySelector('.menuItem');
        const cantidadInput = row.querySelector('.cantidadItem');
        const precioInput = row.querySelector('.precioUnitarioItem');

        // Validar que los elementos existen y tienen valor
        if (menuSelect && cantidadInput && precioInput) {
            const menuId = parseInt(menuSelect.value);
            const cantidad = parseInt(cantidadInput.value);
            const precioUnitario = parseFloat(precioInput.value);

            if (menuId && cantidad && precioUnitario) {
                items.push({
                    menu_id: menuId,
                    cantidad: cantidad,
                    precio_unitario: precioUnitario
                });
            }
        }
    });

    if (!usuario_id || isNaN(usuario_id) || !mesa_id || isNaN(mesa_id) || items.length === 0) {
        alert('Por favor, complete todos los campos requeridos (Mesero, Mesa) y añada al menos un producto con sus datos válidos.');
        return;
    }

    const pedidoData = {
        usuario_id,
        mesa_id,
        estado: 'pendiente', // Por defecto, se crea como pendiente, o mantén el valor si se edita
        items
    };

    // Si estás editando, el estado debería venir del pedido cargado.
    // Si no tienes un campo de estado visible, podrías recuperarlo al editar
    // o forzarlo a 'pendiente' para nuevas creaciones y no modificarlo al editar.
    // Para simplificar según tu request, se omite el campo de estado para nuevas creaciones.
    // Si editas, el backend debería saber el estado. O si lo envías, podrías poner el default.
    // Aquí, para la edición, no se tocará el estado a menos que se cargue explícitamente.
    if (pedidoId) {
        // En modo edición, si quieres mantener el estado original, no lo incluyas
        // o recupera el estado del pedido original al cargarlo para edición.
        // Por simplicidad, si no hay un select de estado, podríamos omitirlo del payload de edición
        // o usar un valor predeterminado si el backend lo requiere.
        // Aquí, como no hay un SELECT de ESTADO visible, lo eliminamos del payload
        // para que el backend no lo actualice a 'pendiente' si el pedido ya está en otro estado.
        // Pero si tu backend *necesita* un estado para PUT, debes manejarlo.
        // Para la creación, "pendiente" es un buen default.
        const currentPedidoStatus = await getCurrentPedidoStatus(pedidoId); // <-- Esto necesita una llamada a la API
        if (currentPedidoStatus) {
            pedidoData.estado = currentPedidoStatus;
        } else {
            console.warn('No se pudo recuperar el estado actual del pedido para la edición. Se usará "pendiente".');
            pedidoData.estado = 'pendiente'; // Fallback
        }
    } else {
        pedidoData.estado = 'pendiente'; // Siempre "pendiente" para nuevos pedidos
    }


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
        // loadPedidos(); // Esta función está deshabilitada ya que no hay tabla visible
        resetForm(); // Limpiar el formulario para un nuevo pedido
    } catch (error) {
        console.error('Error al guardar el pedido:', error);
        alert(`Error al guardar el pedido: ${error.message}`);
    }
}

/**
 * Recupera el estado actual de un pedido desde la API.
 * Útil para la edición cuando el campo de estado no es visible.
 * @param {number} pedidoId - El ID del pedido.
 * @returns {string|null} El estado del pedido o null si no se encuentra.
 */
async function getCurrentPedidoStatus(pedidoId) {
    try {
        const response = await fetch(`http://localhost:3000/api/pedidos/${pedidoId}`);
        if (!response.ok) {
            console.error(`Error fetching pedido status for ID ${pedidoId}: ${response.status}`);
            return null;
        }
        const pedido = await response.json();
        return pedido.estado;
    } catch (error) {
        console.error(`Error al obtener el estado del pedido ${pedidoId}:`, error);
        return null;
    }
}

/**
 * Carga y muestra los pedidos en la tabla (solo si la tabla está presente en el DOM).
 * Esta función ya no se llama automáticamente al cargar la vista simplificada.
 */
async function loadPedidos() {
    if (!pedidosTableBody) {
        console.warn('pedidosTableBody no encontrado. La tabla de pedidos no será cargada. Descomente la tabla en el HTML si desea verla.');
        return;
    }
    // ... lógica de carga de pedidos si la tabla estuviera activa ...
}

/**
 * Adjunta los event listeners a los botones de acción de la tabla de pedidos.
 * Esta función ya no se llama automáticamente al cargar la vista simplificada.
 */
function attachTableEventListeners() {
    // ... lógica de adjuntar eventos si la tabla estuviera activa ...
}

/**
 * Muestra los detalles de un pedido en un modal (si el modal está presente en el DOM).
 * Esta función ya no se llama automáticamente al cargar la vista simplificada.
 * @param {string} id - El ID del pedido a mostrar.
 */
async function viewPedidoDetails(id) {
    if (!pedidoDetailsModalElement) {
        console.warn('El elemento del modal de detalles no fue encontrado. No se pueden mostrar los detalles. Descomente el modal en el HTML si desea usarlo.');
        return;
    }
    // ... lógica de modal si el modal estuviera activo ...
}

/**
 * Carga los datos de un pedido en el formulario para su edición.
 * @param {string} id - El ID del pedido a editar.
 */
async function editPedido(id) {
    if (!id) {
        alert('Por favor, ingrese un ID de pedido para editar.');
        return;
    }
    try {
        const response = await fetch(`http://localhost:3000/api/pedidos/${id}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const pedido = await response.json();

        pedidoIdInput.value = pedido.id;
        usuarioInput.value = pedido.usuario_id;
        mesaSelect.value = pedido.mesa_id;
        // Si tu backend retorna el estado y quieres mantenerlo para la edición
        // Aunque no hay select de estado visible, el backend podría necesitarlo.
        // Puedes guardarlo en una variable si lo necesitas para el PUT.
        // Forzarlo aquí podría ser un problema si ya tiene otro estado.

        itemsContainer.innerHTML = ''; // Limpiar ítems existentes
        if (pedido.items && Array.isArray(pedido.items) && pedido.items.length > 0) {
            pedido.items.forEach(item => addItemToPedidoForm(item));
        } else {
            addItemToPedidoForm(); // Si no hay ítems, añadir uno vacío
        }

        // Ocultar el campo de ID para gestionar una vez cargado
        editDeleteIdContainer.style.display = 'none';
        pedidoIdToManageInput.value = '';

        alert(`Pedido #${pedido.id} cargado para edición.`);
        pedidoForm.scrollIntoView({ behavior: 'smooth' }); // Desplazarse al formulario

    } catch (error) {
        console.error('Error al cargar pedido para edición:', error);
        alert(`No se pudo cargar el pedido para edición: ${error.message}`);
        resetForm(); // Limpiar formulario en caso de error
    }
}

/**
 * Elimina un pedido de la base de datos.
 * @param {string} id - El ID del pedido a eliminar.
 */
async function deletePedido(id) {
    if (!id) {
        alert('Por favor, ingrese un ID de pedido a eliminar o cargue uno en el formulario.');
        return;
    }
    if (!confirm(`¿Está seguro de que desea eliminar el pedido #${id}?`)) {
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
        resetForm(); // Limpiar el formulario después de la eliminación
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
    console.log('Inicializando PedidoController simplificado...');

    // Asignar elementos DOM
    pedidoIdInput = container.querySelector('#pedidoId');
    usuarioInput = container.querySelector('#usuario');
    mesaSelect = container.querySelector('#mesa');
    itemsContainer = container.querySelector('#itemsContainer');
    addItemBtn = container.querySelector('#addItemBtn');
    pedidoForm = container.querySelector('#pedidoForm');

    guardarPedidoBtn = container.querySelector('#guardarPedidoBtn');
    eliminarPedidoBtn = container.querySelector('#eliminarPedidoBtn');
    editarPedidoBtn = container.querySelector('#editarPedidoBtn');
    limpiarFormularioBtn = container.querySelector('#limpiarFormularioBtn');
    volverDashboardBtn = container.querySelector('#volverDashboardBtn');

    pedidoIdToManageInput = container.querySelector('#pedidoIdToManage');
    loadPedidoForEditBtn = container.querySelector('#loadPedidoForEditBtn');
    editDeleteIdContainer = container.querySelector('#editDeleteIdContainer');


    // Validar que los elementos esenciales para el formulario existen
    if (!pedidoIdInput || !usuarioInput || !mesaSelect || !itemsContainer || !addItemBtn || !pedidoForm ||
        !guardarPedidoBtn || !eliminarPedidoBtn || !editarPedidoBtn || !limpiarFormularioBtn || !volverDashboardBtn ||
        !pedidoIdToManageInput || !loadPedidoForEditBtn || !editDeleteIdContainer) {
        console.error('ERROR: No se encontraron todos los elementos HTML necesarios para el formulario de toma de pedido.');
        // Puedes deshabilitar la funcionalidad o mostrar un error visible al usuario
        alert('Error en la carga de la interfaz de pedidos. Faltan elementos críticos.');
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
    // y adjuntar su event listener para el precio automático
    const initialMenuItemSelect = itemsContainer.querySelector('#menuItem0');
    if (initialMenuItemSelect) {
        initialMenuItemSelect.innerHTML = '<option value="">Seleccione un producto</option>' +
                                        allMenuItems.map(product => `<option value="${product.id}" data-price="${product.precio}">${product.nombre}</option>`).join('');
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
        // Fallback si por alguna razón el primer item-row no estaba en el HTML
        addItemToPedidoForm();
    }


    // Adjuntar Event Listeners a los botones
    addItemBtn.addEventListener('click', () => addItemToPedidoForm());
    guardarPedidoBtn.addEventListener('click', savePedido); // Usar click en lugar de submit para controlar mejor
    limpiarFormularioBtn.addEventListener('click', resetForm);
    volverDashboardBtn.addEventListener('click', () => window.location.hash = '#/dashboard'); // Ajusta tu ruta de dashboard

    // Lógica para los botones de Editar y Eliminar
    eliminarPedidoBtn.addEventListener('click', () => {
        const idToDelete = pedidoIdInput.value || pedidoIdToManageInput.value;
        if (idToDelete) {
            deletePedido(idToDelete);
        } else {
            alert('Ingrese el ID del pedido a eliminar o cargue un pedido para eliminar.');
            editDeleteIdContainer.style.display = 'block'; // Mostrar campo de ID si no hay ID cargado
        }
    });

    editarPedidoBtn.addEventListener('click', () => {
        // Muestra el campo para que el usuario ingrese el ID del pedido a editar
        editDeleteIdContainer.style.display = 'block';
    });

    loadPedidoForEditBtn.addEventListener('click', () => {
        const idToEdit = pedidoIdToManageInput.value;
        if (idToEdit) {
            editPedido(idToEdit);
        } else {
            alert('Por favor, ingrese el ID del pedido que desea editar.');
        }
    });

    // Inicializar el formulario
    resetForm();
}