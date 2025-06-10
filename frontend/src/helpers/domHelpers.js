// frontend/src/helpers/domHelpers.js

export function displayMessage(elementId, message, isError) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        if (isError) {
            element.style.color = 'red';
        } else {
            element.style.color = 'green';
        }
        element.style.display = message ? 'block' : 'none'; // Mostrar si hay mensaje, ocultar si no
    }
}