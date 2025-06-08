// frontend/src/pages/RegisterPage.js
// frontend/src/pages/RegisterPage.js

import { registerUser } from '../services/authService.js';
// Asegúrate de que esta línea esté comentada o usa window.router si el router es global
// import { router } from '../utils/router.js';

// Función para mostrar mensajes de error/éxito (si la tienes fuera)
function displayMessage(elementId, message, isError = true) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.color = isError ? '#dc3545' : '#28a745';
        messageElement.style.display = 'block';
    }
}

export function RegisterPage(containerElement) {
    containerElement.innerHTML = `
        <div class="auth-container">
            <h2>Registrarse</h2>
            <form id="registerForm">
                <div class="form-group">
                    <label for="name">Nombre:</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Contraseña:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Confirmar Contraseña:</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" required>
                </div>
                <div class="form-group">
                    <label for="rol">Selecciona tu Rol:</label>
                    <select id="rol" name="rol" required>
                        <option value="">-- Selecciona un rol --</option>
                        <option value="1">Administrador</option>
                        <option value="2">Mesero</option>
                        <option value="3">Cocinero</option>
                        </select>
                </div>
                <button type="submit">Registrar</button>
                <p id="errorMessage" class="error-message"></p>
                <p id="successMessage" class="success-message"></p>
            </form>
            
        </div>
    `;

    const registerForm = containerElement.querySelector('#registerForm');
    const nameInput = containerElement.querySelector('#name');
    const emailInput = containerElement.querySelector('#email');
    const passwordInput = containerElement.querySelector('#password');
    const confirmPasswordInput = containerElement.querySelector('#confirmPassword');
    const errorMessageElement = containerElement.querySelector('#errorMessage');
    const successMessageElement = containerElement.querySelector('#successMessage');
    const submitButton = registerForm.querySelector('button[type="submit"]');
    // --- ¡NUEVA REFERENCIA AL CAMPO DE ROL! ---
    const rolInput = containerElement.querySelector('#rol');
    // ---------------------------------------------

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = nameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        // --- ¡OBTENER EL VALOR DEL ROL SELECCIONADO! ---
        const rolId = rolInput.value; // Ya viene como string del select, el backend lo convertirá a INT
        // ------------------------------------------------

        // Validaciones frontend
        // --- AÑADE 'rolId' A LA VALIDACIÓN INICIAL ---
        if (!name || !email || !password || !confirmPassword || !rolId) {
            displayMessage('errorMessage', 'Por favor, rellena todos los campos, incluyendo el rol.', true);
            return;
        }
        // ---------------------------------------------
        if (password !== confirmPassword) {
            displayMessage('errorMessage', 'Las contraseñas no coinciden.', true);
            return;
        }
        if (password.length < 6) {
            displayMessage('errorMessage', 'La contraseña debe tener al menos 6 caracteres.', true);
            return;
        }

        errorMessageElement.textContent = '';
        successMessageElement.textContent = '';
        submitButton.disabled = true;
        submitButton.textContent = 'Registrando...';

        try {
            // --- ¡PASAR EL 'rolId' AL SERVICIO! ---
            const data = await registerUser(name, email, password, rolId);
            // ------------------------------------

            displayMessage('successMessage', data.message || 'Registro exitoso. ¡Ahora puedes iniciar sesión!', false);
            nameInput.value = '';
            emailInput.value = '';
            passwordInput.value = '';
            confirmPasswordInput.value = '';
            rolInput.value = ''; // Limpiar también el campo de rol

            setTimeout(() => {
                window.router.navigate('/login');
            }, 2000);

        } catch (error) {
            displayMessage('errorMessage', error.message || 'Error en el registro. Inténtalo de nuevo.', true);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Registrar';
        }
    });
}