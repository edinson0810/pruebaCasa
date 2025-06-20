// db.js
// backend/database.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Yamir081015', // reemplázalo si usas otro
  database: 'restaurant_system',
  waitForConnections: true,
  connectionLimit: 10, // Número máximo de conexiones simultáneas
  queueLimit: 0        // 0 = sin límite en la cola de espera
});

export default pool;






