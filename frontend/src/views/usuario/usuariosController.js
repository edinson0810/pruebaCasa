// frontend/src/views/usuarios/usuariosController.js (SIMPLIFICADO PARA SOLO AGREGAR)
import { createUser } from '../../services/userService.js';
import { displayMessage } from '../../helpers/domHelpers.js';

export async function setupUsersPageLogic(containerElement) {
    // Selectores de elementos del DOM (solo los necesarios para agregar)
    const userForm = containerElement.querySelector('#userForm');
    const formMessage = containerElement.querySelector('#formMessage');

    const userNameInput = containerElement.querySelector('#userName');
    const userEmailInput = containerElement.querySelector('#userEmail');
    const userPasswordInput = containerElement.querySelector('#userPassword');
    const userRoleInput = containerElement.querySelector('#userRole');

    // Función para resetear el formulario (simplificada)
    function resetForm() {
        userForm.reset();
        displayMessage('formMessage', '', false); // Limpia el mensaje
    }

    // Event listener para el envío del formulario
    userForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        displayMessage('formMessage', 'Procesando...', false);

        const userData = {
            name: userNameInput.value,
            email: userEmailInput.value,
            password: userPasswordInput.value,
            rol_id: parseInt(userRoleInput.value, 10)
        };

        // Validaciones básicas
        if (!userData.name || !userData.email || !userData.password || !userData.rol_id) {
            displayMessage('formMessage', 'Todos los campos son obligatorios.', true);
            return;
        }
        if (userData.password.length < 6) {
            displayMessage('formMessage', 'La contraseña debe tener al menos 6 caracteres.', true);
            return;
        }

        try {
            await createUser(userData); // Llama al servicio para crear el usuario
            displayMessage('formMessage', 'Empleado creado exitosamente.', false);
            resetForm(); // Limpia el formulario después de la creación
        } catch (error) {
            console.error('Error al crear empleado:', error);
            displayMessage('formMessage', 'Error al crear empleado: ' + (error.message || 'Error desconocido'), true);
        }
    });

    // Opcional: Podrías añadir un evento para limpiar el mensaje al empezar a escribir
    [userNameInput, userEmailInput, userPasswordInput, userRoleInput].forEach(input => {
        input.addEventListener('input', () => {
            displayMessage('formMessage', '', false); // Limpia el mensaje al interactuar con el formulario
        });
    });
}