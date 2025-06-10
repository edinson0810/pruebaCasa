// authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database.js';
import dotenv from 'dotenv';
dotenv.config();

export const registrarUsuario = async (req, res) => {
  const { nombre, email, password, rol_id } = req.body;

  if (!nombre || !email || !password || !rol_id) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO usuarios (nombre, email, password, rol_id) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, rol_id],
      (err) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El email ya está registrado' });
          }
          return res.status(500).json({ message: 'Error al registrar usuario', error: err });
        }

        res.status(201).json({ message: 'Usuario registrado correctamente' });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// ✅ Leer todos los usuarios
export const listarUsuarios = (req, res) => {
  db.query('SELECT id, nombre, email, rol_id FROM usuarios', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener usuarios', error: err });

    res.status(200).json(results);
  });
};

// ✅ Leer un usuario por ID
export const obtenerUsuario = (req, res) => {
  const { id } = req.params;

  db.query('SELECT id, nombre, email, rol_id FROM usuarios WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener usuario', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.status(200).json(results[0]);
  });
};

// ✅ Actualizar usuario
export const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password, rol_id } = req.body;

  if (!nombre || !email || !rol_id) {
    return res.status(400).json({ message: 'Nombre, email y rol son obligatorios' });
  }

  try {
    let updateQuery = '';
    let params = [];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery = 'UPDATE usuarios SET nombre = ?, email = ?, password = ?, rol_id = ? WHERE id = ?';
      params = [nombre, email, hashedPassword, rol_id, id];
    } else {
      updateQuery = 'UPDATE usuarios SET nombre = ?, email = ?, rol_id = ? WHERE id = ?';
      params = [nombre, email, rol_id, id];
    }

    db.query(updateQuery, params, (err) => {
      if (err) return res.status(500).json({ message: 'Error al actualizar usuario', error: err });

      res.status(200).json({ message: 'Usuario actualizado correctamente' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// ✅ Eliminar usuario
export const eliminarUsuario = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM usuarios WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar usuario', error: err });

    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  });
};


export const loginUsuario = (req, res) => {
  const { email, password } = req.body;

    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) {
           return res.status(500).json({ message: 'Error al buscar el usuario', error: err });
    }

    if (results.length === 0) {
           return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const usuario = results[0];
  
    // --- ¡EL PUNTO CLAVE! ---
    const passwordValida = await bcrypt.compare(password, usuario.password);
    
    if (!passwordValida) {
           return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

   // --- ¡AQUÍ ES DONDE VA EL CÓDIGO QUE PREGUNTASTE! ---
    const token = jwt.sign(
      { id: usuario.id, rol_id: usuario.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: '5m' } // Token válido por 5 minutos
    );
    console.log('Token generado:', token); // <-- Tu console.log aquí

    const refreshToken = jwt.sign(
      { id: usuario.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '1d' } // Refresh token válido por 1 día
    );
    console.log('Refresh Token generado:', refreshToken); // <-- Tu console.log aquí
    // ----------------------------------------------------

    console.log('Backend: Login exitoso para usuario:', email);
    res.status(200).json({
      message: 'Login exitoso',
      token,
      refreshToken,
      user: { // Es buena práctica devolver algo de información del usuario al frontend
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol_id: usuario.rol_id // Para que el frontend pueda manejar roles
      }
    });
  });
};

export const renovarToken = (req, res) => {
    // Esta función típicamente:
    // 1. Recibe el refreshToken del cliente (normalmente en el cuerpo o en las cookies).
    // 2. Verifica la validez del refreshToken.
    // 3. Si es válido, genera un nuevo accessToken y un nuevo refreshToken.
    // 4. Envía los nuevos tokens al cliente.

    // Ejemplo básico (necesitará más lógica para ser robusto):
    const { refreshToken } = req.body; // O de las cookies, o de headers

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token no proporcionado.' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) {
            console.error('Error al verificar refresh token:', err);
            return res.status(403).json({ message: 'Refresh token inválido o expirado.' });
        }

        // Si el refresh token es válido, generar un nuevo token de acceso
        // (Necesitas obtener el rol_id del usuario desde la DB o si viene en el refresh token)
        // Asumo que tu refresh token solo tiene 'id', así que necesitarías buscar en la DB para el rol_id
        // O, si sabes que es un ID de usuario válido, podrías generarlo solo con el ID por ahora
        const newAccessToken = jwt.sign(
            { id: user.id, rol_id: user.rol_id }, // Asegúrate de tener rol_id aquí
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );

        const newRefreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Token renovado exitosamente',
            token: newAccessToken,
            refreshToken: newRefreshToken
        });
    });
};
    
