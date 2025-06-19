// backend/app.js
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';

import rolRoutes from './routes/rolRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import detallePedidoController from './routes/detallePedidoRoutes.js';
import cocinaController from './routes/cocinaRoutes.js';
import pagoController from './routes/pagoRoutes.js';
import reporteController from './routes/reporteRoutes.js';
import db from './database.js';
import dotenv from 'dotenv';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/detalles', detallePedidoController);
app.use('/api/cocina', cocinaController);
app.use('/api/pago', pagoController);
app.use('/api/reporte', reporteController);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

