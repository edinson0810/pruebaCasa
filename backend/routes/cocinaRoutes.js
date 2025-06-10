import express from 'express';
import { obtenerPedidosPendientes, marcarPedidoListo } from '../controllers/cocinaController.js';

const router = express.Router();

router.get('/pendientes', obtenerPedidosPendientes);
router.put('/marcar-listo/:pedido_id', marcarPedidoListo);

export default router;
