import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database.js'; 
import dotenv from 'dotenv';
dotenv.config();

// Registrar usuario
export const registrarUsuario = async (req, res) => {
  const { nombre, email, password, rol_id } = req.body;

  if (!nombre || !email || !password || !rol_id) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      'INSERT INTO usuarios (nombre, email, password, rol_id) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, rol_id]
    );

    res.status(201).json({ message: 'Usuario registrado correctamente' });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ message: 'Error al registrar usuario', error: err.message });
  }
};

// Obtener todos los usuarios
export const listarUsuarios = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, nombre, email, rol_id FROM usuarios');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: err.message });
  }
};

// Obtener un usuario por ID
export const obtenerUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.execute('SELECT id, nombre, email, rol_id FROM usuarios WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuario', error: err.message });
  }
};

// Actualizar usuario
export const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password, rol_id } = req.body;

  if (!nombre || !email || !rol_id) {
    return res.status(400).json({ message: 'Nombre, email y rol son obligatorios' });
  }

  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.execute(
        'UPDATE usuarios SET nombre = ?, email = ?, password = ?, rol_id = ? WHERE id = ?',
        [nombre, email, hashedPassword, rol_id, id]
      );
    } else {
      await db.execute(
        'UPDATE usuarios SET nombre = ?, email = ?, rol_id = ? WHERE id = ?',
        [nombre, email, rol_id, id]
      );
    }

    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: err.message });
  }
};

// Eliminar usuario
export const eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute('DELETE FROM usuarios WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado para eliminar' });
    }
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: err.message });
  }
};

// Login
export const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: usuario.id, rol_id: usuario.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    const refreshToken = jwt.sign(
      { id: usuario.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login exitoso',
      token,
      refreshToken,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol_id: usuario.rol_id
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor al iniciar sesión', error: err.message });
  }
};

// Renovar token
export const renovarToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token no proporcionado' });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, payload) => {
    if (err) {
      return res.status(403).json({ message: 'Refresh token inválido o expirado' });
    }

    try {
      const [rows] = await db.execute('SELECT rol_id FROM usuarios WHERE id = ?', [payload.id]);

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const { rol_id } = rows[0];

      const newAccessToken = jwt.sign(
        { id: payload.id, rol_id },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );

      const newRefreshToken = jwt.sign(
        { id: payload.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '1d' }
      );

      res.status(200).json({
        message: 'Token renovado exitosamente',
        token: newAccessToken,
        refreshToken: newRefreshToken
      });

    } catch (error) {
      res.status(500).json({ message: 'Error al renovar token', error: error.message });
    }
  });
};
