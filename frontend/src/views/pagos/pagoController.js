// src/views/pagos/pagoController.js
const API_BASE_URL = 'http://localhost:3000/api'; 

// La función setupPagoController DEBE ser la que se exporta y se llama externamente.
// No debe contener su propio DOMContentLoaded.
export function setupPagoController() {
    // console.log("PagoController: setupPagoController ejecutándose.");

    // INICIO: Funcionalidad para el botón "Volver al Dashboard"
    const dashboardBtn = document.getElementById('dashboard-btn');
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
            console.log("Botón 'Volver al Dashboard' clickeado. Navegando hacia atrás en el historial.");
            window.history.back(); 
        });
    } else {
        console.warn("Botón del Dashboard (#dashboard-btn) no encontrado en el DOM. Asegúrate de que el ID sea correcto en tu HTML.");
    }
    // FIN: Funcionalidad para el botón "Volver al Dashboard"

    // La función principal de carga de pedidos se llama directamente desde aquí
    // porque se asume que setupPagoController ya será llamado DESPUÉS del DOMContentLoaded
    // en tu archivo de entrada principal (ej. main.js o un script en el HTML).
    fetchAndDisplayPedidosParaPagar(); 
}

const fetchAndDisplayPedidosParaPagar = async () => {
    const pedidosListContainer = document.getElementById('pedidos-para-pagar');
    if (!pedidosListContainer) {
        console.error("Contenedor de pedidos no encontrado: #pedidos-para-pagar");
        return;
    }
    pedidosListContainer.innerHTML = '<p class="no-pedidos">Cargando pedidos...</p>'; 

    try {
        const response = await fetch(`${API_BASE_URL}/pago/pendientes`); 
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error HTTP! Estado: ${response.status}, Mensaje: ${errorText}`);
        }

        const pedidos = await response.json(); 
        pedidosListContainer.innerHTML = ''; 

        if (pedidos.length === 0) {
            pedidosListContainer.innerHTML = '<p class="no-pedidos">No hay pedidos pendientes de pago en este momento.</p>';
            return;
        }

        pedidos.forEach(pedido => {
            const pedidoCard = document.createElement('div');
            pedidoCard.classList.add('pedido-card');
            pedidoCard.dataset.pedidoId = pedido.pedido_id;

            const itemsList = pedido.items.map(item => `
                <li>${item.cantidad} x ${item.menu_item_nombre} ($${item.precio_unitario})</li>
            `).join('');

            const totalNumerico = Number(pedido.total);
            if (isNaN(totalNumerico)) {
                console.warn(`El total del pedido ${pedido.pedido_id} no es un número válido:`, pedido.total);
                pedido.total = 'N/A'; 
            } else {
                pedido.total = totalNumerico;
            }

            pedidoCard.innerHTML = `
                <h3>Pedido #${pedido.pedido_id} (Mesa: ${pedido.mesa_id})</h3>
                <p><strong>Usuario:</strong> ${pedido.usuario}</p>
                <p><strong>Fecha:</strong> ${new Date(pedido.fecha_pedido).toLocaleString()}</p>
                <p><strong>Estado:</strong> <span style="font-weight: bold; color: blue;">${pedido.estado.toUpperCase()}</span></p>
                <p><strong>Observaciones:</strong> ${pedido.observaciones || 'Ninguna'}</p>
                <p><strong>Total:</strong> <span style="font-weight: bold; color: green; font-size: 1.1em;">$${(isNaN(pedido.total) ? 'N/A' : pedido.total.toFixed(2))}</span></p>
                <h4>Detalle del Pedido:</h4>
                <ul class="items-list">${itemsList}</ul>
                <button class="marcar-pagado-btn" data-id="${pedido.pedido_id}">Marcar como Pagado</button>
            `;

            pedidosListContainer.appendChild(pedidoCard);
        });

        document.querySelectorAll('.marcar-pagado-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const pedidoId = event.target.dataset.id;
                await marcarPedidoComoPagado(pedidoId);
            });
        });

    } catch (error) {
        console.error("Error al obtener y mostrar pedidos para pagar:", error);
        pedidosListContainer.innerHTML = '<p class="no-pedidos" style="color: red;">Error al cargar los pedidos. Por favor, inténtalo de nuevo.</p>';
        alert("Hubo un error al cargar los pedidos pendientes de pago. Consulta la consola para más detalles.");
    }
};

const marcarPedidoComoPagado = async (pedidoId) => {
    if (!confirm(`¿Estás seguro de que quieres marcar el Pedido #${pedidoId} como PAGADO?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/pago/${pedidoId}/pagado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: 'pagado' })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error HTTP! Estado: ${response.status}, Mensaje: ${errorText}`);
        }

        const result = await response.json();
        alert(result.message);
        fetchAndDisplayPedidosParaPagar(); 
    } catch (error) {
        console.error("Error al marcar pedido como pagado:", error);
        alert("Hubo un error al marcar el pedido como pagado: " + error.message);
    }
};