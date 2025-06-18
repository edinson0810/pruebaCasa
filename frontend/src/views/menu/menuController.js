// controllers/menuController.js
/// // frontend/src/controllers/menuController.js

export function setupMenuController(container) {
    const apiUrl = 'http://localhost:3000/api/menu'; // URL de tu API de menú
    const token = localStorage.getItem('token'); // Obtener el token de autenticación

    // Seleccionar elementos del DOM
    const form = container.querySelector('#menuForm');
    const idField = container.querySelector('#menuId');
    const nombreInput = container.querySelector('#nombre');
    const descripcionInput = container.querySelector('#descripcion');
    const precioInput = container.querySelector('#precio');
    const categoriaSelect = container.querySelector('#categoria'); // Este es el select de categoría
    const tableBody = container.querySelector('#menuTable tbody');
    const resetBtn = container.querySelector('#resetBtn');
    const volverBtn = container.querySelector('#volverDashboardBtn');

    // Cargar menú al inicio
    cargarMenu();

    // Event listener para el botón "Volver al Dashboard"
    if (volverBtn) {
        volverBtn.addEventListener('click', () => {
            window.router.navigate('/dashboard');
        });
    }

    // Event listener para el botón "Limpiar" del formulario
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            form.reset(); // Resetea todos los campos del formulario
            idField.value = ''; // Limpia el campo oculto del ID
        });
    }

    // Event listener para enviar el formulario (Guardar o Actualizar)
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevenir el comportamiento por defecto del formulario

            const platillo = {
                nombre: nombreInput.value,
                descripcion: descripcionInput.value,
                precio: parseFloat(precioInput.value),
                // Envía el valor del select, que ahora debe ser el ID numérico
                categoria: categoriaSelect.value 
            };

            // Validaciones básicas antes de enviar al backend
            if (!platillo.nombre || !platillo.precio) {
                alert('Nombre y precio son obligatorios.');
                return;
            }
            if (isNaN(platillo.precio)) {
                alert('El precio debe ser un número válido.');
                return;
            }
            if (!platillo.categoria) {
                alert('La categoría es obligatoria.');
                return;
            }


            const id = idField.value; // Obtener el ID si estamos editando
            const method = id ? 'PUT' : 'POST'; // Usar PUT para actualizar, POST para crear
            const url = id ? `${apiUrl}/${id}` : apiUrl; // Construir la URL de la API

            try {
                const res = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}` // Incluir el token en los headers
                    },
                    body: JSON.stringify(platillo) // Enviar los datos del platillo como JSON
                });

                const data = await res.json(); // Parsear la respuesta del servidor

                if (!res.ok) {
                    throw new Error(data.message || 'Error desconocido al procesar la solicitud.');
                }

                alert(data.message || 'Operación realizada correctamente'); // Mostrar mensaje de éxito
                form.reset(); // Limpiar el formulario
                idField.value = ''; // Limpiar el ID oculto
                cargarMenu(); // Recargar la lista del menú para mostrar los cambios
            } catch (err) {
                console.error('Error en la operación del menú:', err);
                alert('Error: ' + err.message); // Mostrar mensaje de error al usuario
            }
        });
    }

    // Función para cargar y mostrar la lista del menú
    async function cargarMenu() {
        tableBody.innerHTML = ''; // Limpiar el cuerpo de la tabla antes de cargar nuevos datos
        try {
            const res = await fetch(apiUrl, {
                headers: { Authorization: `Bearer ${token}` } // Incluir el token en los headers
            });
            const platos = await res.json();

            if (!res.ok) {
                throw new Error(platos.message || 'Error al obtener el menú.');
            }

            if (platos.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay productos en el menú.</td></tr>';
                return;
            }

            platos.forEach(plato => {
                const row = document.createElement('tr');
                // Asegúrate de que plato.precio sea un número antes de usar toFixed()
                const precioMostrado = plato.precio ? parseFloat(plato.precio).toFixed(2) : '0.00'; 
                row.innerHTML = `
                    <td data-label="Nombre">${plato.nombre || 'N/A'}</td>
                    <td data-label="Descripción">${plato.descripcion || 'N/A'}</td>
                    <td data-label="Precio">$${precioMostrado}</td>
                    <td data-label="Categoría">${plato.categoria_nombre || 'N/A'}</td> 
                    <td data-label="Acciones" class="action-buttons">
                        <button class="btn btn-primary editar-btn" data-id="${plato.id}">Editar</button>
                        <button class="btn btn-danger eliminar-btn" data-id="${plato.id}">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (err) {
            console.error('Error al cargar el menú:', err);
            alert('Error al cargar el menú: ' + err.message);
        }
    }

    // Delegación de eventos para los botones de Editar y Eliminar en la tabla
    tableBody.addEventListener('click', async (e) => {
        const id = e.target.dataset.id; // Obtener el ID del platillo desde el atributo data-id

        if (e.target.classList.contains('editar-btn')) {
            try {
                const res = await fetch(`${apiUrl}/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const plato = await res.json();

                if (!res.ok) {
                    throw new Error(plato.message || 'Error al obtener el platillo para edición.');
                }

                // Rellenar el formulario con los datos del platillo para su edición
                idField.value = plato.id;
                nombreInput.value = plato.nombre;
                descripcionInput.value = plato.descripcion;
                precioInput.value = plato.precio;
                // Al editar, el select debe mostrar el ID, no el nombre, para seleccionar la opción correcta
                categoriaSelect.value = plato.categoria_id; 
            } catch (err) {
                console.error('Error al cargar el platillo para edición:', err);
                alert('Error al cargar el platillo: ' + err.message);
            }
        }

        if (e.target.classList.contains('eliminar-btn')) {
            if (!confirm('¿Estás seguro de que quieres eliminar este platillo? Esta acción no se puede deshacer.')) {
                return; 
            }

            try {
                const res = await fetch(`${apiUrl}/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'Error al eliminar el platillo.');
                }

                alert(data.message); 
                cargarMenu(); 
            } catch (err) {
                console.error('Error al eliminar el platillo:', err);
                alert('Error al eliminar: ' + err.message);
            }
        }
    });
}