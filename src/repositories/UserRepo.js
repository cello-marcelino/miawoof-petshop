const db = require('../config/database');

class UserRepo {
    static async findByUsername(username) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT id, username, full_name, email, no_hp, alamat, role FROM users WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async createCustomer({ username, password, full_name, email, no_hp, alamat }) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO users (username, password, full_name, email, no_hp, alamat, role) VALUES (?, ?, ?, ?, ?, ?, 'customer')`;
            db.run(sql, [username, password, full_name, email, no_hp, alamat], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, username, full_name, role: 'customer' });
            });
        });
    }

    static async getAllUsers() {
        return new Promise((resolve, reject) => {
            db.all('SELECT id, username, full_name, email, no_hp, alamat, role FROM users ORDER BY id DESC', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async updateProfile(id, { full_name, email, no_hp, alamat, password }) {
        return new Promise((resolve, reject) => {
            let sql = 'UPDATE users SET full_name = ?, email = ?, no_hp = ?, alamat = ?';
            const params = [full_name, email, no_hp, alamat];

            if (password) {
                sql += ', password = ?';
                params.push(password);
            }
            sql += ' WHERE id = ?';
            params.push(id);

            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    static async deleteUser(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM users WHERE id = ? AND role != "admin"', [id], function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    static async countUsers() {
        return new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as total_users FROM users WHERE role = "customer"', [], (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.total_users : 0);
            });
        });
    }
}

module.exports = UserRepo;
