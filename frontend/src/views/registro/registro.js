// frontend/src/views/registro/registro.js

import { registerUser } from '../../services/authService.js'; // Rutas relativas
import { displayMessage } from '../../helpers/domHelpers.js'; // Ajustado a 'helpers'

export function setupRegisterPageLogic(containerElement) {
    const registerForm = containerElement.querySelector('#registerForm');
    const nameInput = containerElement.querySelector('#name');
    const emailInput = containerElement.querySelector('#regEmail');
    const passwordInput = containerElement.querySelector('#regPassword');
    const confirmPasswordInput = containerElement.querySelector('#confirmPassword');
    const messageElement = containerElement.querySelector('#message');
    const submitButton = registerForm.querySelector('button[type="submit"]');

    if (!registerForm) {
        console.error("RegisterForm not found in containerElement. Make sure index.html (registro) is loaded.");
        return;
    }

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        displayMessage('message', '', false); // Limpiar mensajes previos

        const nombre = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!nombre || !email || !password || !confirmPassword) {
            displayMessage('message', 'Todos los campos son obligatorios.', true);
            return;
        }

        if (password !== confirmPassword) {
            displayMessage('message', 'Las contraseñas no coinciden.', true);
            return;
        }

        const rolId = 4; // Rol por defecto para el auto-registro

        submitButton.disabled = true;
        submitButton.textContent = 'Registrando...';

        try {
            const data = await registerUser(nombre, email, password, rolId);
            displayMessage('message', data.message || 'Registro exitoso. ¡Ahora puedes iniciar sesión!', false);
            registerForm.reset(); // Limpia el formulario
            setTimeout(() => {
                window.router.navigate('/login'); // Navega al login después del registro exitoso
            }, 2000);
        } catch (error) {
            console.error('Error durante el registro:', error);
            displayMessage('message', error.message || 'Error de registro. Inténtalo de nuevo.', true);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Registrarse';
        }
    });

    // Enlazar el botón/enlace de inicio de sesión
    const loginLink = containerElement.querySelector('a[href="/login"]');
    if (loginLink) {
        loginLink.addEventListener('click', (event) => {
            event.preventDefault();
            window.router.navigate('/login');
        });
    }
}