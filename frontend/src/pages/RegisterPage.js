// frontend/src/pages/RegisterPage.js

import { setupRegisterPageLogic } from '../views/registro/registro.js'; // Importa la lógica JS de registro

const REGISTER_HTML_PATH = '/src/views/registro/index.html'; // Ruta al HTML del registro

export async function RegisterPage(containerElement) {
    try {
        const response = await fetch(REGISTER_HTML_PATH);
        if (!response.ok) {
            throw new Error(`No se pudo cargar la plantilla HTML del registro: ${response.statusText} (${response.status})`);
        }
        const htmlContent = await response.text();

        containerElement.innerHTML = htmlContent;
        setupRegisterPageLogic(containerElement);

    } catch (error) {
        console.error('Error al cargar o renderizar RegisterPage:', error);
        containerElement.innerHTML = `<p class="error-message">Error al cargar la página de registro: ${error.message}</p>`;
    }
}