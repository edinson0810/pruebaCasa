
// src/views/reportes/reportesController.js


// Base URL para tu backend API. ¡AJUSTA ESTO A TU URL REAL DEL BACKEND!
const API_BASE_URL = 'http://localhost:3000/api'; 

// Function that initializes the controller, receives the container element and a callback for navigation.
export function setupReporteController(containerElement, onBackToDashboard) { // <-- Acepta un nuevo argumento: onBackToDashboard
    // It is crucial to select elements within the 'containerElement'
    // so that they work correctly when the view is loaded dynamically.
    const reportTypeSelect = containerElement.querySelector('#report-type-select');
    const startDateInput = containerElement.querySelector('#start-date');
    const endDateInput = containerElement.querySelector('#end-date');
    const generateReportBtn = containerElement.querySelector('#generate-report-btn');
    const reportOutput = containerElement.querySelector('#report-output');
   const volverDashboardBtn = document.getElementById('volverDashboardBtn');; // El ID en el HTML es back-to-pagos-btn

    // Assign current date by default to date fields
    const today = new Date();
    const year = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0!
    const dd = String(today.getDate()).padStart(2, '0');

    // By default, from the beginning of the year until today
    startDateInput.value = `${year}-01-01`;
    endDateInput.value = `${year}-${mm}-${dd}`;

    // Event Listener for the "Volver al Dashboard" button
    if (volverDashboardBtn) {
        volverDashboardBtn.addEventListener('click', () => {
         window.router.navigate('/dashboard'); // Esto forzará una recarga completa y navegación a esa URL
        });
    }

    // Event Listener for the "Generar Reporte" button
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', () => {
            generateReport();
        });
    }

    /**
     * Function to fetch report data from the backend API.
     * This now makes actual fetch calls.
     */
    async function fetchReportData(reportType, startDate, endDate) {
        try {
            let apiUrl = '';
            // Construye la URL de la API basándose en el tipo de reporte
            if (reportType === 'pedidos-pagados') {
                apiUrl = `${API_BASE_URL}/reporte/pedidos-pagados?startDate=${startDate}&endDate=${endDate}`;
            } else if (reportType === 'ventas-por-fecha') {
                apiUrl = `${API_BASE_URL}/reporte/ventas-por-fecha?startDate=${startDate}&endDate=${endDate}`;
            } else {
                console.warn(`Tipo de reporte desconocido: ${reportType}`);
                return []; // Retorna un array vacío si el tipo de reporte no es reconocido
            }

            const response = await fetch(apiUrl);
            
            // Verifica si la respuesta HTTP es exitosa (estado 2xx)
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP! Estado: ${response.status}, Mensaje: ${errorText}`);
            }

            // Parsea la respuesta JSON
            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Error al obtener datos del reporte desde el backend:', error);
            // Muestra un mensaje de error amigable en la interfaz de usuario
            reportOutput.innerHTML = `<p class="error-message" style="color: red;">Error al cargar los datos del reporte: ${error.message}. Asegúrate de que el backend esté corriendo y las rutas sean correctas.</p>`;
            return []; // Retorna datos vacíos en caso de error para evitar que la aplicación se detenga
        }
    }

    /**
     * Main function to generate and render the selected report.
     */
    async function generateReport() {
        reportOutput.innerHTML = '<p class="loading-message">Generando reporte...</p>'; // Show loading message
        const reportType = reportTypeSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        const data = await fetchReportData(reportType, startDate, endDate);

        let htmlContent = '';
        // Check if data is an array (for 'pedidos-pagados') or an object (for 'ventas-por-fecha')
        if (reportType === 'pedidos-pagados') {
            htmlContent = `
                <h2>Reporte de Pedidos Pagados</h2>
                <p>Desde: <strong>${startDate}</strong> Hasta: <strong>${endDate}</strong></p>
                <table>
                    <thead>
                        <tr>
                            <th>ID Pedido</th>
                            <th>Fecha</th>
                            <th>Usuario</th>
                            <th>Total</th>
                            <!-- 'Método de Pago' eliminado ya que no está directamente en tu tabla 'pedidos' -->
                        </tr>
                    </thead>
                    <tbody>
            `;
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(pedido => {
                    const totalFormatted = typeof pedido.total === 'number' && !isNaN(pedido.total)
                        ? pedido.total.toLocaleString('es-CO')
                        : 'N/A';
                    htmlContent += `
                        <tr>
                            <td>${pedido.id}</td>
                            <td>${pedido.fecha}</td>
                            <td>${pedido.usuario}</td>
                            <td>$${totalFormatted}</td>
                            <!-- Datos de 'Método de Pago' eliminados -->
                        </tr>
                    `;
                });
            } else {
                // Adjust colspan to 4 columns
                htmlContent += `<tr><td colspan="4" class="no-data-message">No hay pedidos pagados en este rango de fechas o el backend no devolvió datos.</td></tr>`;
            }
            htmlContent += `
                    </tbody>
                </table>
            `;
        } else if (reportType === 'ventas-por-fecha') {
            // Check if data is an object with 'labels', 'data', and 'totalGeneral'
            if (data && Array.isArray(data.labels) && Array.isArray(data.data) && typeof data.totalGeneral === 'number') {
                htmlContent = `
                    <h2>Reporte de Ventas por Fecha</h2>
                    <p>Desde: <strong>${startDate}</strong> Hasta: <strong>${endDate}</strong></p>
                    <div class="chart-container">
                        <canvas id="ventasChart"></canvas>
                    </div>
                    <p class="total-ventas">Total de Ventas en el Periodo: <strong>$${data.totalGeneral.toLocaleString('es-CO')}</strong></p>
                `;
            } else {
                 htmlContent = `<p class="no-data-message">No hay datos de ventas por fecha disponibles o el formato es incorrecto desde el backend.</p>`;
            }
        }

        reportOutput.innerHTML = htmlContent;

        // If it's the sales by date report, render the chart (will be empty if data is empty)
        if (reportType === 'ventas-por-fecha' && data && Array.isArray(data.labels) && Array.isArray(data.data)) {
            renderVentasChart(data.labels, data.data);
        }
    }

    /**
     * Function to render the sales chart.
     * Requires Chart.js to be loaded.
     */
    function renderVentasChart(labels, data) {
        const ctx = containerElement.querySelector('#ventasChart')?.getContext('2d');
        if (!ctx) {
            console.error('No se encontró el elemento canvas #ventasChart o no se pudo obtener su contexto 2D.');
            return;
        }

        // If a Chart instance already exists on the canvas, destroy it to avoid duplicates
        if (Chart.getChart(ctx)) {
            Chart.getChart(ctx).destroy();
        }

        new Chart(ctx, {
            type: 'bar', // You can change to 'line', 'pie', etc.
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas Diarias',
                    data: data,
                    backgroundColor: 'rgba(63, 81, 181, 0.7)',
                    borderColor: 'rgba(63, 81, 181, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow the chart to adjust its height
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Valor de Ventas ($)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Fecha'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += '$' + context.parsed.y.toLocaleString('es-CO');
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Dynamically loads the Chart.js library if it is not already loaded.
     */
    function loadChartJs() {
        if (typeof Chart === 'undefined') { 
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => {
                generateReport(); // Generate initial report once Chart.js is ready
            };
            document.head.appendChild(script);
        } else {
            console.log('Chart.js ya está cargado.');
            generateReport(); // Generate initial report if Chart.js is already loaded
        }
    }

    // Start the process: load Chart.js and then generate the initial report.
    loadChartJs();
}