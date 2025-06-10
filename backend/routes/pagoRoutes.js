import express from 'express';
import {
  registrarPago,
  listarPagos,
  listarPedidosSinPagar
} from '../controllers/pagoController.js';

const router = express.Router();

router.post('/', registrarPago);
router.get('/', listarPagos);
router.get('/pendientes', listarPedidosSinPagar);

export default router;
