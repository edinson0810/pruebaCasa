// frontend/src/services/empleadoService.js

const API_URL = 'http://localhost:3000/api/auth'; // Ajusta si usas otra ruta

export async function getEmpleados() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function crearEmpleado(empleado) {
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(empleado)
  });
}

export async function actualizarEmpleado(id, empleado) {
  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(empleado)
  });
}

export async function eliminarEmpleado(id) {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
}
