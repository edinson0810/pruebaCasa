import express from 'express';
import {
  obtenerReportes,
  generarReporteDiario,
  eliminarReporte
} from '../controllers/reporteController.js';

const router = express.Router();

router.get('/', obtenerReportes);
router.post('/generar', generarReporteDiario);
router.delete('/:id', eliminarReporte);

export default router;
