// routes/menuRoutes.js
import express from 'express';
import {
  obtenerMenu,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from '../controllers/menuController.js';

const router = express.Router();

router.get('/', obtenerMenu);
router.get('/:id', obtenerProductoPorId);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

export default router;
