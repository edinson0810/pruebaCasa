// BACKEND/src/models/User.js (Ejemplo simplificado con array en memoria)
let users = []; // En un proyecto real, esto sería tu conexión a la DB
let nextId = 1;

class User {
    static async findAll() {
        return Promise.resolve(users);
    }
    static async findById(id) {
        return Promise.resolve(users.find(u => u.id === id));
    }
    static async create(userData) {
        const newUser = { id: nextId++, ...userData, createdAt: new Date().toISOString() };
        users.push(newUser);
        return Promise.resolve(newUser);
    }
    static async update(id, updateData) {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;
        users[index] = { ...users[index], ...updateData };
        return Promise.resolve(users[index]);
    }
    static async delete(id) {
        const initialLength = users.length;
        users = users.filter(u => u.id !== id);
        return Promise.resolve(initialLength !== users.length);
    }
}
module.exports = User;