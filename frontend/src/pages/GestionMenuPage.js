// frontend/src/pages/GestionMenuPage.js

export async function GestionMenuPage(containerElement) {
  try {
    // 1. Cargar el HTML de empleados
    const response = await fetch('/src/views/menu/menu.html');
    if (!response.ok) {
      throw new Error('No se pudo cargar la vista de menu.');
    }
    const html = await response.text();
    containerElement.innerHTML = html;

    // 2. Importar y ejecutar el controlador
    const { setupMenuController } = await import('/src/views/menu/menuController.js');
    setupMenuController(containerElement);

  } catch (error) {
    console.error('Error al cargar Gestión de Empleados:', error);
    containerElement.innerHTML = `<p class="error-message">Error al cargar la página de empleados.</p>`;
  }
}