// frontend/src/services/authService.js
const API_BASE_URL = 'http://localhost:3000/api/auth';

export async function loginUser(email, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error desconocido al iniciar sesión.');
    }
    return data; // Devolver toda la data, incluyendo user.nombre y user.rol_id
}

export async function registerUser(nombre, email, password, rolId) { // <-- ¡Y también aquí para registerUser!
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, rol_id: rolId })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario.');
    }
    return data;
}