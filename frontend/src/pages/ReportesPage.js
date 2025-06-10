// frontend/src/pages/ReportesPage.js

export async function ReportesPage(containerElement) {
    containerElement.innerHTML = `
        <div class="gestion-container">
            <h2>Reportes</h2>
            <p>Esta página está en construcción. Aquí podrás generar y ver reportes.</p>
            <button class="btn btn-secondary" onclick="window.router.navigate('/dashboard')">Volver al Dashboard</button>
        </div>
    `;
}