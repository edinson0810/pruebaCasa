// frontend/src/pages/GestionMenuPage.js

export async function GestionMenuPage(containerElement) {
    containerElement.innerHTML = `
        <div class="gestion-container">
            <h2>Gestión de Menú</h2>
            <p>Esta página está en construcción. Aquí podrás administrar el menú.</p>
            <button class="btn btn-secondary" onclick="window.router.navigate('/dashboard')">Volver al Dashboard</button>
        </div>
    `;
}