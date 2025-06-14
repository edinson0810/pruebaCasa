// frontend/src/views/login/loginController.js
import { loginUser } from '../../services/authService.js';
import { displayMessage } from '../../helpers/domHelpers.js'; // Ajustado a 'helpers'

export function setupLoginPageLogic(containerElement) {
    const loginForm = containerElement.querySelector('#loginForm');
    const emailInput = containerElement.querySelector('#email');
    const passwordInput = containerElement.querySelector('#password');
    const errorMessageElement = containerElement.querySelector('#errorMessage');
    const submitButton = loginForm.querySelector('button[type="submit"]');

    if (!loginForm) {
        console.error("LoginForm not found in containerElement. Make sure index.html (login) is loaded.");
        return;
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        displayMessage('errorMessage', '', false); // Limpiar mensajes previos

        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            displayMessage('errorMessage', 'Por favor, rellena todos los campos.', true);
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Iniciando sesión...';

        try {
            const data = await loginUser(email, password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('userName', data.user.nombre);
            localStorage.setItem('userRole', data.user.rol_id);

            displayMessage('errorMessage', data.message || 'Inicio de sesión exitoso.', false);
            setTimeout(() => {
                window.router.navigate('/dashboard'); // Navega al dashboard después del éxito
            }, 1500);
        } catch (error) {
            console.error('Error durante el login:', error);
            displayMessage('errorMessage', error.message || 'Error de login. Inténtalo de nuevo.', true);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Iniciar Sesión';
        }
    });

    // Enlazar el botón/enlace de registro
    const registerLink = containerElement.querySelector('a[href="/register"]');
    if (registerLink) {
        registerLink.addEventListener('click', (event) => {
            event.preventDefault(); // Evita la navegación por defecto
            window.router.navigate('/register');
        });
    }

    // ✅ Enlazar el enlace de "¿Olvidaste tu contraseña?"
    const forgotPasswordLink = containerElement.querySelector('#forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (event) => {
            event.preventDefault(); // Evita navegación completa
            window.router.navigate('/recuperar'); // Redirige a la vista de recuperación
        });
    }
}

