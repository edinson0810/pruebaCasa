import express from 'express';
import { registrarUsuario, loginUsuario, renovarToken } from '../controllers/authController.js';


const router = express.Router();

router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);
router.post('/refresh', renovarToken);


export default router;



