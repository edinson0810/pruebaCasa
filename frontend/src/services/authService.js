// frontend/src/services/authService.js

// Asegúrate que esta URL apunte a tu servidor backend
const API_BASE_URL = 'http://localhost:3000/api/auth';

export async function registerUser(nombre, email, password, rolId) {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, rolId })
    });
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Error desconocido al registrar.');
    }
    return data;
}

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
    return data;
}