// frontend/src/pages/LoginPage.js

// Importa la lógica JavaScript específica de la vista de login
import { setupLoginPageLogic } from '../views/login/loginController.js';

// Ruta al archivo HTML de la vista de login (tal como Vite lo vería)
const LOGIN_HTML_PATH = '/src/views/login/index.html';

export async function LoginPage(containerElement) {
    try {
        const response = await fetch(LOGIN_HTML_PATH);
        if (!response.ok) {
            throw new Error(`No se pudo cargar la plantilla HTML del login: ${response.statusText} (${response.status})`);
        }
        const htmlContent = await response.text();

        containerElement.innerHTML = htmlContent; // Inyecta el HTML en el contenedor principal
        setupLoginPageLogic(containerElement); // Ejecuta la lógica después de que el HTML esté en el DOM

    } catch (error) {
        console.error('Error al cargar o renderizar LoginPage:', error);
        containerElement.innerHTML = `<p class="error-message">Error al cargar la página de inicio de sesión: ${error.message}</p>`;
    }
}