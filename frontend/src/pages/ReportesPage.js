// frontend/src/pages/ReportesPage.js

export async function ReportesPage(containerElement) {
    try {
    // 1. Cargar el HTML de empleados
    const response = await fetch('/src/views/reportes/index.html');
    if (!response.ok) {
      throw new Error('No se pudo cargar la vista de menu.');
    }
    const html = await response.text();
    containerElement.innerHTML = html;

    // 2. Importar y ejecutar el controlador
    const { setupReporteController } = await import('/src/views/reportes/reportesController.js');
    setupReporteController(containerElement);

  } catch (error) {
    console.error('Error al cargar Gestión de Empleados:', error);
    containerElement.innerHTML = `<p class="error-message">Error al cargar la página de empleados.</p>`;
  }
}