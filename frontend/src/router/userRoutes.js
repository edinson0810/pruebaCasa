// BACKEND/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); // <--- Asegúrate de que esta ruta sea correcta y que tu middleware exista

// Proteger estas rutas para que solo usuarios autenticados (y con el rol adecuado) puedan acceder
router.get('/', authMiddleware, userController.getUsers);
router.post('/', authMiddleware, userController.createUser);
router.put('/:id', authMiddleware, userController.updateUser);
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;