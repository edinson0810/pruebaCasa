// frontend/src/services/userService.js
// frontend/src/services/userService.js
const API_BASE_URL = 'http://localhost:3000/api';

async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        // El backend devuelve { message: '...' } en caso de error.
        throw new Error(data.message || 'Error en la solicitud.');
    }
    return data;
}

function getAuthHeaders() {
    const token = localStorage.getItem('token'); // Asegúrate de que el token se guarda aquí en el login
    if (!token) {
        console.warn('No hay token de autenticación disponible. El usuario no está logueado o el token expiró.');
        // Puedes redirigir al login aquí si no hay token
        window.router.navigate('/login'); // Redirección automática si no hay token
        throw new Error('No autorizado: Token no encontrado.');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Formato esperado por tu authMiddleware
    };
}

export async function createUser(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, { // Apunta a la ruta POST /api/users
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        });
        return handleResponse(response);
    } catch (error) {
        console.error('Error en createUser:', error);
        throw error;
    }
}