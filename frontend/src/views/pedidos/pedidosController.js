// public/js/controllers/pedidosController.js

// No necesitas importar el CSS aquí, ya se cargará en index.html
// import '../../css/pedidos.css'; // ELIMINAR ESTA LÍNEA

const API_BASE_URL = 'http://localhost:3000/api';

// Elementos del DOM (variables globales).
let pedidoForm;
let pedidoIdInput;
let usuarioInput;
let mesaSelect;
let observacionesTextarea;
let itemsContainer;
let addItemBtn;
let guardarPedidoBtn;
let limpiarFormularioBtn;
let volverDashboardBtn;
let totalPedidoSpan;

let menuOptions = [];

// La función de setup se exporta para ser llamada por el enrutador
export const setupPedidoController = () => {
    // Asignación de elementos del DOM.
    pedidoForm = document.getElementById('pedidoForm');
    pedidoIdInput = document.getElementById('pedidoId');
    usuarioInput = document.getElementById('usuario');
    mesaSelect = document.getElementById('mesa');
    observacionesTextarea = document.getElementById('observaciones');
    itemsContainer = document.getElementById('itemsContainer');
    addItemBtn = document.getElementById('addItemBtn');
    guardarPedidoBtn = document.getElementById('guardarPedidoBtn');
    limpiarFormularioBtn = document.getElementById('limpiarFormularioBtn');
    volverDashboardBtn = document.getElementById('volverDashboardBtn');
    totalPedidoSpan = document.getElementById('totalPedido');

    // Configuración de Event Listeners
    if (pedidoForm) pedidoForm.addEventListener('submit', handleSavePedido);
    if (addItemBtn) addItemBtn.addEventListener('click', addItemRow);
    if (itemsContainer) {
        itemsContainer.addEventListener('click', handleRemoveItem);
        itemsContainer.addEventListener('change', (event) => {
            if (event.target.classList.contains('cantidadItem') || event.target.classList.contains('menuItem')) {
                updateTotal();
            }
        });
    }
    if (limpiarFormularioBtn) limpiarFormularioBtn.addEventListener('click', clearForm);

    // *** CAMBIO CLAVE AQUÍ: Usar window.router.navigate ***
   if (volverDashboardBtn) {
        volverDashboardBtn.addEventListener('click', () => {
         window.router.navigate('/dashboard'); // Esto forzará una recarga completa y navegación a esa URL
        });
    }

       // Cargar datos iniciales
    loadMenuOptions();
    addItemRow();
    clearForm();
    updateTotal();
};

// Opcional: una función de limpieza si el controlador necesita liberar recursos (ej. eliminar event listeners)
export const teardown = () => {
    // Aquí puedes quitar listeners si fueron añadidos globalmente o de formas que persistan.
    // Para este controlador, con los listeners atados a elementos específicos que se eliminan del DOM,
    // es menos crítico, pero es una buena práctica en SPAs.
    if (pedidoForm) pedidoForm.removeEventListener('submit', handleSavePedido);
    if (addItemBtn) addItemBtn.removeEventListener('click', addItemRow);
    if (itemsContainer) {
        itemsContainer.removeEventListener('click', handleRemoveItem);
        // Podrías necesitar un control más granular para los eventos change si se añaden muchos
    }
    if (limpiarFormularioBtn) limpiarFormularioBtn.removeEventListener('click', clearForm);
    if (volverDashboardBtn) {
        // Eliminar el listener específico que se añadió
        const clonedBtn = volverDashboardBtn.cloneNode(true);
        volverDashboardBtn.parentNode.replaceChild(clonedBtn, volverDashboardBtn);
        volverDashboardBtn = clonedBtn; // Reasignar para evitar leaks si se clona
    }
};


// Funciones auxiliares (fetchMenu, loadMenuOptions, populateMenuItemSelect, updateTotal, updatePriceField, addItemRow, handleRemoveItem, clearForm)
// Son las mismas que tenías, solo asegúrate de las rutas internas si usas `import` de CSS
async function fetchMenu() {
    try {
        const response = await fetch(`${API_BASE_URL}/menu`);
        if (!response.ok) {
            throw new Error(`No se pudo cargar el menú: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener el menú:', error);
        alert('Error al cargar el menú: ' + error.message);
        return [];
    }
}

async function loadMenuOptions() {
    menuOptions = await fetchMenu();
    document.querySelectorAll('.menuItem').forEach(select => {
        populateMenuItemSelect(select);
    });
}

function populateMenuItemSelect(selectElement) {
    selectElement.innerHTML = '<option value="">Seleccione un producto</option>';
    menuOptions.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.nombre} - $${parseFloat(item.precio).toFixed(2)} - ID:${item.id}`;
        selectElement.appendChild(option);
    });
    // Es mejor añadir el listener una vez después de poblar, o verificar si ya existe
    selectElement.removeEventListener('change', updatePriceField); // Evitar duplicados
    selectElement.addEventListener('change', updatePriceField);
}

function updateTotal() {
    let currentTotal = 0;
    if (!itemsContainer) {
        console.warn("itemsContainer es null en updateTotal. No se puede calcular el total.");
        return;
    }
    const itemRows = itemsContainer.querySelectorAll('.item-row');

    itemRows.forEach(row => {
        const cantidadInput = row.querySelector('.cantidadItem');
        const precioInput = row.querySelector('.precioUnitarioItem');

        const cantidad = parseFloat(cantidadInput.value) || 0;
        const precioUnitario = parseFloat(precioInput.value) || 0;

        currentTotal += (cantidad * precioUnitario);
    });

    if (totalPedidoSpan) {
        totalPedidoSpan.textContent = currentTotal.toFixed(2);
    } else {
        console.warn("Elemento con ID 'totalPedido' no encontrado en el DOM para actualizar. Este es el motivo del error 'Cannot read properties of null'.");
    }
}

function updatePriceField(event) {
    const selectElement = event.target;
    const itemRow = selectElement.closest('.item-row');
    const precioInput = itemRow.querySelector('.precioUnitarioItem');
    const selectedMenuItem = menuOptions.find(item => item.id == selectElement.value);

    if (selectedMenuItem) {
        precioInput.value = parseFloat(selectedMenuItem.precio).toFixed(2);
    } else {
        precioInput.value = '';
    }
    updateTotal();
}

async function handleSavePedido(event) {
    event.preventDefault();

    // Validaciones iniciales para elementos DOM críticos
    if (!usuarioInput || !mesaSelect || !observacionesTextarea || !itemsContainer || !totalPedidoSpan) {
        alert("Error interno: No se pudieron encontrar todos los elementos del formulario. Revise el HTML y los IDs.");
        console.error("Faltan elementos del DOM. Usuario:", usuarioInput, "Mesa:", mesaSelect, "Observaciones:", observacionesTextarea, "Items:", itemsContainer, "Total:", totalPedidoSpan);
        return;
    }

    const usuario_id = parseInt(usuarioInput.value);
    const mesa_id = parseInt(mesaSelect.value);
    const observaciones = observacionesTextarea.value.trim();
    const estado = 'pendiente';

    const items = [];
    const itemRows = itemsContainer.querySelectorAll('.item-row');
    let hasError = false;

    if (itemRows.length === 0) {
        alert('Un pedido debe tener al menos un producto.');
        return;
    }

    itemRows.forEach(row => {
        const menuId = row.querySelector('.menuItem').value;
        const cantidad = row.querySelector('.cantidadItem').value;
        const precioUnitario = row.querySelector('.precioUnitarioItem').value;

        if (!menuId || !cantidad || !precioUnitario || isNaN(parseInt(cantidad)) || isNaN(parseFloat(precioUnitario))) {
            hasError = true;
            alert('Por favor, complete todos los campos de los productos con valores válidos.');
            return;
        }

        items.push({
            menu_id: parseInt(menuId),
            cantidad: parseInt(cantidad),
            precio_unitario: parseFloat(precioUnitario)
        });
    });

    if (hasError) return;

    updateTotal();
    const totalPedido = parseFloat(totalPedidoSpan.textContent);

    const pedidoData = {
        usuario_id,
        mesa_id,
        estado,
        observaciones,
        items,
        total: totalPedido
    };

    // console.log('Enviando nuevo pedido:', pedidoData);

    try {
        const url = `${API_BASE_URL}/pedidos`;
        const method = 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedidoData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error del backend al guardar el pedido:', errorData);
            throw new Error(errorData.message || 'Error al guardar el pedido');
        }

        const result = await response.json();
        alert(result.message);
        clearForm();

        // *** CAMBIO CLAVE AQUÍ: Usar window.router.navigate ***
        // if (window.router && typeof window.router.navigate === 'function') {
        //     window.router.navigate('/cocina');
        // } else {
        //     console.error("window.router.navigate no está definido. ¿Está el enrutador cargado correctamente?");
        //     // Fallback si el router no funciona (recargar página completa)
        //     window.location.href = '/cocina';
        // }

    } catch (error) {
        console.error('Error en el frontend al guardar el pedido:', error);
        alert(`Error al guardar el pedido: ${error.message}`);
    }
}

let itemIndexCounter = 0;

function addItemRow(detail = null) {
    if (!itemsContainer) {
        console.error("itemsContainer es null. No se puede añadir fila de item.");
        return;
    }
    const currentItemIndex = itemIndexCounter++;

    const itemRow = document.createElement('div');
    itemRow.classList.add('item-row', 'row', 'g-2', 'align-items-center', 'mb-3');
    itemRow.dataset.itemIndex = currentItemIndex;

    itemRow.innerHTML = `
        <div class="col-md-5 col-sm-12">
            <select class="form-select menuItem" id="menuItem${currentItemIndex}" data-index="${currentItemIndex}" required></select>
        </div>
        <div class="col-md-2 col-sm-4 col-4">
            <input type="number" class="form-control cantidadItem" id="cantidadItem${currentItemIndex}" data-index="${currentItemIndex}" value="${detail ? detail.cantidad : 1}" min="1" required>
        </div>
        <div class="col-md-3 col-sm-5 col-5 d-flex align-items-center">
            <input type="text" class="form-control me-2 precioUnitarioItem" id="precioUnitarioItem${currentItemIndex}" data-index="${currentItemIndex}" readonly placeholder="Precio">
            <button type="button" class="removeItemBtn btn btn-sm btn-outline-danger">X</button>
        </div>
    `;
    itemsContainer.appendChild(itemRow);

    const newMenuItemSelect = itemRow.querySelector(`#menuItem${currentItemIndex}`);
    populateMenuItemSelect(newMenuItemSelect);
    newMenuItemSelect.addEventListener('change', updatePriceField); // Asegúrate de que este listener se añade aquí


    const precioInput = itemRow.querySelector(`#precioUnitarioItem${currentItemIndex}`);
    if (detail && detail.precio_unitario) {
        precioInput.value = parseFloat(detail.precio_unitario).toFixed(2);
    } else {
        precioInput.value = '';
    }
    updateTotal();
}

function handleRemoveItem(event) {
    if (event.target.classList.contains('removeItemBtn')) {
        const itemRow = event.target.closest('.item-row');
        if (itemRow) {
            itemRow.remove();
            if (itemsContainer && itemsContainer.querySelectorAll('.item-row').length === 0) {
                addItemRow();
            }
            updateTotal();
        }
    }
}

function clearForm() {
    if (pedidoForm) pedidoForm.reset();
    if (pedidoIdInput) pedidoIdInput.value = '';
    if (observacionesTextarea) observacionesTextarea.value = '';
    if (itemsContainer) itemsContainer.innerHTML = '';
    itemIndexCounter = 0;
    addItemRow();
    if (usuarioInput) usuarioInput.focus();
    updateTotal();
}