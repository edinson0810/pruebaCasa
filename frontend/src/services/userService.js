// frontend/src/services/userService.js
const API_BASE_URL = 'http://localhost:3000/api'; // Ajusta la URL base de tu API

async function handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Error en la solicitud.');
    }
    return data;
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

export async function getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: getAuthHeaders()
    });
    return handleResponse(response);
}

export async function createUser(userData) {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
    });
    return handleResponse(response);
}

export async function updateUser(id, userData) {
    const response = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/users/</span>{id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
    });
    return handleResponse(response);
}

export async function deleteUser(id) {
    const response = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/users/</span>{id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (response.status === 204) {
        return { message: 'Usuario eliminado exitosamente.' };
    }
    return handleResponse(response);
}