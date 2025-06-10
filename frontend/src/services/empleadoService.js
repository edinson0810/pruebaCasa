// frontend/src/services/empleadoService.js

const API_BASE_URL = 'http://localhost:3000/api'; // Ajusta la URL base de tu API

// Función auxiliar para manejar las respuestas de la API
async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error en la solicitud.');
    }
    return data;
}

// Función auxiliar para obtener el token de autenticación
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Incluir el token en el header
    };
}

export async function getEmpleados() {
    const response = await fetch(`${API_BASE_URL}/empleados`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return handleResponse(response);
}

export async function getEmpleadoById(id) {
    const response = await fetch(`${API_BASE_URL}/empleados/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return handleResponse(response);
}

export async function createEmpleado(empleadoData) {
    const response = await fetch(`${API_BASE_URL}/empleados`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(empleadoData)
    });
    return handleResponse(response);
}

export async function updateEmpleado(id, empleadoData) {
    const response = await fetch(`${API_BASE_URL}/empleados/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(empleadoData)
    });
    return handleResponse(response);
}

export async function deleteEmpleado(id) {
    const response = await fetch(`${API_BASE_URL}/empleados/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    // Para las eliminaciones, a menudo el backend no devuelve JSON, solo un status 204 No Content
    if (response.status === 204) {
        return { message: 'Empleado eliminado exitosamente.' };
    }
    return handleResponse(response); // Si el backend envía algún JSON
}