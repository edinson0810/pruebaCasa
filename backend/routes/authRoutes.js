import express from 'express';
import { registrarUsuario, listarUsuarios,obtenerUsuario,actualizarUsuario,eliminarUsuario,loginUsuario, renovarToken } from '../controllers/authController.js';


const router = express.Router();

router.post('/register', registrarUsuario);
router.get('/', listarUsuarios);                      // Leer todos
router.get('/:id', obtenerUsuario);                   // Leer uno
router.put('/:id', actualizarUsuario);                // Actualizar
router.delete('/:id', eliminarUsuario);               // Eliminar
router.post('/login', loginUsuario);
router.post('/refresh', renovarToken);


export default router;



