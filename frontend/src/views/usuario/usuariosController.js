// frontend/src/views/usuarios/usuariosController.js
import { getUsers, createUser, updateUser, deleteUser } from '../../services/userService.js';
import { displayMessage } from '../../helpers/domHelpers.js';

let currentEditingUserId = null;

export async function setupUsersPageLogic(containerElement) {
    const userForm = containerElement.querySelector('#userForm');
    const usersTableBody = containerElement.querySelector('#usersTableBody');
    const formTitle = containerElement.querySelector('#formTitle');
    const submitBtn = containerElement.querySelector('#submitBtn');
    const cancelBtn = containerElement.querySelector('#cancelBtn');
    const formMessage = containerElement.querySelector('#formMessage');
    const listMessage = containerElement.querySelector('#listMessage');

    const userIdInput = containerElement.querySelector('#userId');
    const userNameInput = containerElement.querySelector('#userName');
    const userEmailInput = containerElement.querySelector('#userEmail');
    const userPasswordInput = containerElement.querySelector('#userPassword');
    const userRoleInput = containerElement.querySelector('#userRole');

    const roleMap = { '1': 'Administrador', '2': 'Mesero', '3': 'Cocinero' };

    async function loadUsers() {
        displayMessage('listMessage', 'Cargando usuarios...', false);
        try {
            const users = await getUsers();
            usersTableBody.innerHTML = '';
            if (users.length === 0) {
                usersTableBody.innerHTML = '<tr><td colspan="5">No hay usuarios registrados.</td></tr>';
                displayMessage('listMessage', '', false);
                return;
            }
            users.forEach(user => {
                const row = usersTableBody.insertRow();
                row.insertCell(0).textContent = user.id;
                row.insertCell(1).textContent = user.name;
                row.insertCell(2).textContent = user.email;
                row.insertCell(3).textContent = roleMap[user.rol_id] || 'Desconocido';

                const actionsCell = row.insertCell(4);
                const editButton = document.createElement('button');
                editButton.textContent = 'Editar';
                editButton.classList.add('btn', 'btn-edit');
                editButton.addEventListener('click', () => editUser(user));

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Eliminar';
                deleteButton.classList.add('btn', 'btn-delete');
                deleteButton.addEventListener('click', () => confirmDeleteUser(user.id, user.name));

                actionsCell.appendChild(editButton);
                actionsCell.appendChild(deleteButton);
            });
            displayMessage('listMessage', '', false);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            displayMessage('listMessage', 'Error al cargar usuarios: ' + (error.message || 'Error desconocido'), true);
        }
    }

    function editUser(user) {
        currentEditingUserId = user.id;
        userIdInput.value = user.id;
        userNameInput.value = user.name;
        userEmailInput.value = user.email;
        userPasswordInput.value = '';
        userPasswordInput.removeAttribute('required');
        userRoleInput.value = user.rol_id;

        formTitle.textContent = 'Editar';
        submitBtn.textContent = 'Actualizar Usuario';
        cancelBtn.style.display = 'inline-block';
        displayMessage('formMessage', '', false);
    }

    function resetForm() {
        userForm.reset();
        currentEditingUserId = null;
        userIdInput.value = '';
        formTitle.textContent = 'Crear';
        submitBtn.textContent = 'Crear Usuario';
        cancelBtn.style.display = 'none';
        displayMessage('formMessage', '', false);
        userPasswordInput.setAttribute('required', 'required');
    }

    async function confirmDeleteUser(id, name) {
        if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${name}?`)) {
            try {
                await deleteUser(id);
                displayMessage('listMessage', `Usuario ${name} eliminado exitosamente.`, false);
                loadUsers();
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                displayMessage('listMessage', 'Error al eliminar usuario: ' + (error.message || 'Error desconocido'), true);
            }
        }
    }

    userForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        displayMessage('formMessage', 'Procesando...', false);

        const userData = {
            name: userNameInput.value,
            email: userEmailInput.value,
            rol_id: parseInt(userRoleInput.value, 10)
        };

        if (!currentEditingUserId || userPasswordInput.value) {
            userData.password = userPasswordInput.value;
        }

        if (!userData.name || !userData.email || !userData.rol_id) {
            displayMessage('formMessage', 'Nombre, Email y Rol son obligatorios.', true);
            return;
        }

        if (!currentEditingUserId && !userData.password) {
            displayMessage('formMessage', 'La contraseña es obligatoria para nuevos usuarios.', true);
            return;
        }
        if (userData.password && userData.password.length < 6) {
            displayMessage('formMessage', 'La contraseña debe tener al menos 6 caracteres.', true);
            return;
        }

        try {
            if (currentEditingUserId) {
                await updateUser(currentEditingUserId, userData);
                displayMessage('formMessage', 'Usuario actualizado exitosamente.', false);
            } else {
                await createUser(userData);
                displayMessage('formMessage', 'Usuario creado exitosamente.', false);
            }
            resetForm();
            loadUsers();
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            displayMessage('formMessage', 'Error al guardar usuario: ' + (error.message || 'Error desconocido'), true);
        }
    });

    cancelBtn.addEventListener('click', resetForm);

    userPasswordInput.addEventListener('input', () => {
        if (currentEditingUserId) {
            userPasswordInput.removeAttribute('required');
        } else {
            userPasswordInput.setAttribute('required', 'required');
        }
    });

    loadUsers();
}