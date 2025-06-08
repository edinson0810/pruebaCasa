// frontend/src/pages/LoginPage.js
import { loginUser } from '../services/authService.js'; // Importar la lógica de autenticación
// import { router } from '../utils/router.js'; // Importar la instancia del router si es global o pasarla

export function LoginPage(containerElement) {
    containerElement.innerHTML = `
        <div class="auth-container">
            <h2>Iniciar Sesión</h2>
            <form id="loginForm">
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Contraseña:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit">Iniciar Sesión</button>
                <p id="errorMessage" class="error-message"></p>
            </form>
           
        </div>
    `;

    const loginForm = containerElement.querySelector('#loginForm');
    const emailInput = containerElement.querySelector('#email');
    const passwordInput = containerElement.querySelector('#password');
    const errorMessageElement = containerElement.querySelector('#errorMessage');
    const submitButton = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessageElement.textContent = ''; // Limpiar errores previos

        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            errorMessageElement.textContent = 'Por favor, rellena todos los campos.';
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Iniciando sesión...';

        try {
            const data = await loginUser(email, password); // Llamada al servicio
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('userName', data.user.nombre);
              localStorage.setItem('userRole', data.user.rol_id);
            window.router.navigate('/dashboard'); // <--- ¡CAMBIO HECHO!
    } catch (error) {
            errorMessageElement.textContent = error.message || 'Error de login.';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Iniciar Sesión';
        }
    });
}