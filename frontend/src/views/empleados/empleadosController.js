// frontend/src/views/empleados/empleadosController.js
export function setupEmpleadoController(containerElement) {
  const token = localStorage.getItem('token');
  const apiUrl = 'http://localhost:3000/api/auth';

  const ROLES = {
    1: 'Administrador',
    2: 'Empleado',
    3: 'Cocinero'
  };

  const form = containerElement.querySelector('#empleadoForm');
  const tableBody = containerElement.querySelector('#empleadosTable tbody');

  const idField = containerElement.querySelector('#empleadoId');
  const nombreField = containerElement.querySelector('#nombre');
  const emailField = containerElement.querySelector('#email');
  const passwordField = containerElement.querySelector('#password');
  const rolField = containerElement.querySelector('#rol');
  const resetBtn = containerElement.querySelector('#resetBtn');

  const volverBtn = containerElement.querySelector('#volverDashboardBtn');
  volverBtn?.addEventListener('click', () => {
    window.router.navigate('/dashboard');
  });

  // Mostrar empleados
  async function cargarEmpleados() {
    tableBody.innerHTML = '';
    try {
      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const empleados = await res.json();

      empleados.forEach(emp => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${emp.nombre}</td>
          <td>${emp.email}</td>
          <td>${ROLES[emp.rol_id] || 'Desconocido'}</td>
          <td>
            <button class="editar-btn" data-id="${emp.id}">Editar</button>
            <button class="eliminar-btn" data-id="${emp.id}">Eliminar</button>
          </td>
        `;
        tableBody.appendChild(row);
      });

    } catch (err) {
      console.error('Error al cargar empleados:', err);
    }
  }

  // Crear o actualizar
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const empleado = {
      nombre: nombreField.value,
      email: emailField.value,
      password: passwordField.value,
      rol_id: parseInt(rolField.value)
    };

   const id = idField.value;
const method = id ? 'PUT' : 'POST';
const url = id ? `${apiUrl}/${id}` : `${apiUrl}/register`;


    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(empleado)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(data.message || 'Empleado guardado');
      form.reset();
      idField.value = '';
      await cargarEmpleados();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });

  // Botón limpiar
  resetBtn.addEventListener('click', () => {
    form.reset();
    idField.value = '';
  });

  // Delegar clic en Editar / Eliminar
  tableBody.addEventListener('click', async (e) => {
    const id = e.target.dataset.id;

    if (e.target.classList.contains('editar-btn')) {
      try {
        const res = await fetch(`${apiUrl}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const empleados = await res.json();
        const empleado = empleados.find(emp => emp.id == id);

        if (empleado) {
          idField.value = empleado.id;
          nombreField.value = empleado.nombre;
          emailField.value = empleado.email;
          rolField.value = empleado.rol_id;
          passwordField.value = '';
        }
      } catch (err) {
        alert('Error al cargar datos del empleado');
      }
    }

    if (e.target.classList.contains('eliminar-btn')) {
      if (!confirm('¿Eliminar este empleado?')) return;

      try {
        const res = await fetch(`${apiUrl}/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        alert(data.message);
        await cargarEmpleados();
      } catch (err) {
        alert('Error al eliminar empleado');
      }
    }
  });

  // Inicializar
  cargarEmpleados();
}
