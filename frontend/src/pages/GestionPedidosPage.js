// frontend/src/pages/GestionPedidosPage.js

export async function GestionPedidosPage(containerElement) {
    containerElement.innerHTML = `
        <div class="gestion-container">
            <h2>Gestión de Pedidos</h2>
            <p>Esta página está en construcción. Aquí podrás gestionar los pedidos.</p>
            <button class="btn btn-secondary" onclick="window.router.navigate('/dashboard')">Volver al Dashboard</button>
        </div>
    `;
}