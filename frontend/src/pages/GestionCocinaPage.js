// frontend/src/pages/GestionCocinaPage.js

export async function GestionCocinaPage(containerElement) {
    containerElement.innerHTML = `
        <div class="gestion-container">
            <h2>Gestión de Cocina</h2>
            <p>Esta página está en construcción. Aquí podrás gestionar las operaciones de cocina.</p>
            <button class="btn btn-secondary" onclick="window.router.navigate('/dashboard')">Volver al Dashboard</button>
        </div>
    `;
}