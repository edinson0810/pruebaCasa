/// frontend/src/pages/GestionEmpleadosPage.js

export async function GestionEmpleadosPage(containerElement) {
    // No necesitamos cargar el token aquí si solo mostramos un mensaje estático
    // const token = localStorage.getItem('token');
    // if (!token) {
    //     window.router.navigate('/login');
    //     return;
    // }

    containerElement.innerHTML = `
        <div class="gestion-container">
            <h2>Gestión de Empleados</h2>
            <p>Esta página está en construcción. Aquí podrás administrar los empleados (usuarios).</p>
            <button class="btn btn-secondary" onclick="window.router.navigate('/dashboard')">Volver al Dashboard</button>
        </div>
    `;
}