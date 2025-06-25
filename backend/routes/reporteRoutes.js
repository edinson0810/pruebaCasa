// src/routes/reporteRoutes.js
import express from 'express';
import {
  // Las funciones existentes que manejan la tabla 'reporte'
  obtenerReportes,
  generarReporteDiario,
  eliminarReporte,
  
  // Las nuevas funciones para los reportes que el frontend espera
  getPedidosPagadosReport, 
  getVentasPorFechaReport
} from '../controllers/reporteController.js';

const router = express.Router();

// Ruta para obtener todos los reportes de la tabla 'reporte' (si aún la usas)
router.get('/', obtenerReportes); 

// Rutas para los reportes específicos que el frontend del Panel de Reportes llamará
router.get('/pedidos-pagados', getPedidosPagadosReport); // Endpoint para pedidos pagados
router.get('/ventas-por-fecha', getVentasPorFechaReport); // Endpoint para ventas por fecha

// Mantienes tus otras rutas si son necesarias para otras funcionalidades
router.post('/generar', generarReporteDiario); 
router.delete('/:id', eliminarReporte);

export default router;