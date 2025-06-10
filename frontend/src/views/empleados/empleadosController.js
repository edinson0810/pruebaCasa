// frontend/src/views/empleados/empleadosController.js

import {
    getEmpleados,
    createEmpleado,
    updateEmpleado,
    deleteEmpleado
} from '../../services/empleadoService.js';
import {
    displayMessage
} from '../../helpers/domHelpers.js';

let currentEditingEmpleadoId = null; // Para saber qué empleado estamos editando

export async function setupEmpleadosPageLogic(containerElement) {
    const empleadoForm = containerElement.querySelector('#empleadoForm');
    const empleadosTableBody = containerElement.querySelector('#empleadosTableBody');
    const formTitle = containerElement.querySelector('#formTitle');
    const submitBtn = containerElement.querySelector('#submitBtn');
    const cancelBtn = containerElement.querySelector('#cancelBtn');
    const formMessage = containerElement.querySelector('#formMessage');
    const listMessage = containerElement.querySelector('#listMessage');

    // Referencias a los campos del formulario
    const empleadoIdInput = containerElement.querySelector('#empleadoId');
    const nombreInput = containerElement.querySelector('#nombre');
    const apellidoInput = containerElement.querySelector('#apellido');
    const emailInput = containerElement.querySelector('#email');
    const telefonoInput = containerElement.querySelector('#telefono');
    const fechaContratacionInput = containerElement.querySelector('#fechaContratacion');
    const puestoInput = containerElement.querySelector('#puesto');
    const salarioInput = containerElement.querySelector('#salario');
    const estadoInput = containerElement.querySelector('#estado');

    // Función para cargar y mostrar empleados
    async function loadEmpleados() {
        displayMessage('listMessage', 'Cargando empleados...', false);
        try {
            const empleados = await getEmpleados();
            empleadosTableBody.innerHTML = ''; // Limpiar tabla
            if (empleados.length === 0) {
                empleadosTableBody.innerHTML = '<tr><td colspan="7">No hay empleados registrados.</td></tr>';
                displayMessage('listMessage', '', false);
                return;
            }
            empleados.forEach(empleado => {
                const row = empleadosTableBody.insertRow();
                row.insertCell(0).textContent = empleado.id;
                row.insertCell(1).textContent = empleado.nombre;
                row.insertCell(2).textContent = empleado.apellido;
                row.insertCell(3).textContent = empleado.email;
                row.insertCell(4).textContent = empleado.puesto;
                row.insertCell(5).textContent = empleado.estado; // Mostrar estado

                const actionsCell = row.insertCell(6);
                const editButton = document.createElement('button');
                editButton.textContent = 'Editar';
                editButton.classList.add('btn', 'btn-edit');
                editButton.addEventListener('click', () => editEmpleado(empleado));

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Eliminar';
                deleteButton.classList.add('btn', 'btn-delete');
                deleteButton.addEventListener('click', () => confirmDeleteEmpleado(empleado.id, empleado.nombre));

                actionsCell.appendChild(editButton);
                actionsCell.appendChild(deleteButton);
            });
            displayMessage('listMessage', '', false);
        } catch (error) {
            console.error('Error al cargar empleados:', error);
            displayMessage('listMessage', 'Error al cargar empleados: ' + error.message, true);
        }
    }

    // Función para rellenar el formulario para edición
    function editEmpleado(empleado) {
        currentEditingEmpleadoId = empleado.id;
        empleadoIdInput.value = empleado.id;
        nombreInput.value = empleado.nombre;
        apellidoInput.value = empleado.apellido;
        emailInput.value = empleado.email;
        telefonoInput.value = empleado.telefono || ''; // Puede ser nulo
        // Formatear la fecha a 'YYYY-MM-DD' para el input type="date"
        fechaContratacionInput.value = empleado.fechaContratacion ? new Date(empleado.fechaContratacion).toISOString().split('T')[0] : '';
        puestoInput.value = empleado.puesto;
        salarioInput.value = empleado.salario;
        estadoInput.value = empleado.estado; // Rellenar el select

        formTitle.textContent = 'Editar';
        submitBtn.textContent = 'Actualizar Empleado';
        cancelBtn.style.display = 'inline-block'; // Mostrar botón de cancelar
        displayMessage('formMessage', '', false); // Limpiar mensaje del formulario
    }

    // Función para resetear el formulario
    function resetForm() {
        empleadoForm.reset();
        currentEditingEmpleadoId = null;
        empleadoIdInput.value = '';
        formTitle.textContent = 'Crear';
        submitBtn.textContent = 'Crear Empleado';
        cancelBtn.style.display = 'none';
        displayMessage('formMessage', '', false);
    }

    // Confirmación antes de eliminar
    async function confirmDeleteEmpleado(id, nombre) {
        if (confirm(`¿Estás seguro de que quieres eliminar a ${nombre}?`)) {
            try {
                await deleteEmpleado(id);
                displayMessage('listMessage', `Empleado ${nombre} eliminado exitosamente.`, false);
                loadEmpleados(); // Recargar la lista
            } catch (error) {
                console.error('Error al eliminar empleado:', error);
                displayMessage('listMessage', 'Error al eliminar empleado: ' + error.message, true);
            }
        }
    }

    // Manejador del submit del formulario (Crear/Actualizar)
    empleadoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        displayMessage('formMessage', 'Procesando...', false);

        const empleadoData = {
            nombre: nombreInput.value,
            apellido: apellidoInput.value,
            email: emailInput.value,
            telefono: telefonoInput.value,
            fechaContratacion: fechaContratacionInput.value,
            puesto: puestoInput.value,
            salario: parseFloat(salarioInput.value),
            estado: estadoInput.value
        };

        try {
            if (currentEditingEmpleadoId) {
                await updateEmpleado(currentEditingEmpleadoId, empleadoData);
                displayMessage('formMessage', 'Empleado actualizado exitosamente.', false);
            } else {
                await createEmpleado(empleadoData);
                displayMessage('formMessage', 'Empleado creado exitosamente.', false);
            }
            resetForm();
            loadEmpleados(); // Recargar la lista de empleados
        } catch (error) {
            console.error('Error al guardar empleado:', error);
            displayMessage('formMessage', 'Error al guardar empleado: ' + error.message, true);
        }
    });

    // Manejador del botón Cancelar
    cancelBtn.addEventListener('click', resetForm);

    // Cargar empleados al iniciar la página
    loadEmpleados();
}