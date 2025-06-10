// frontend/src/pages/EstadoPedidosPage.js

export async function EstadoPedidosPage(containerElement) {
    containerElement.innerHTML = `
        <div class="gestion-container">
            <h2>Estado de Pedidos</h2>
            <p>Esta página está en construcción. Aquí podrás ver el estado de los pedidos.</p>
            <button class="btn btn-secondary" onclick="window.router.navigate('/dashboard')">Volver al Dashboard</button>
        </div>
    `;
}