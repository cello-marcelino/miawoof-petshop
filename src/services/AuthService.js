const UserRepo = require('../repositories/UserRepo');
const bcrypt = require('bcrypt');
const Sanitizer = require('../utils/Sanitizer');

class AuthService {
    static async register({ username, password, confirm_password, full_name, email, no_hp, alamat }) {
        const cleanUsername = Sanitizer.cleanInput(username);
        const cleanFullName = Sanitizer.cleanInput(full_name);

        if (!cleanUsername || !password || !cleanFullName) {
            throw new Error('Username, Nama Lengkap, dan Password wajib diisi.');
        }

        if (password !== confirm_password) {
            throw new Error('Konfirmasi password tidak cocok.');
        }

        if (password.length < 6) {
            throw new Error('Password minimal harus 6 karakter.');
        }

        // Check if username already exists
        const existingUser = await UserRepo.findByUsername(cleanUsername);
        if (existingUser) {
            throw new Error('Username sudah digunakan oleh akun lain. Silakan gunakan username lain.');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ALWAYS force role to 'customer' for security (Prevents privilege escalation)
        const newUser = await UserRepo.createCustomer({
            username: cleanUsername,
            password: hashedPassword,
            full_name: cleanFullName,
            email: Sanitizer.cleanInput(email),
            no_hp: Sanitizer.cleanInput(no_hp),
            alamat: Sanitizer.cleanInput(alamat)
        });

        return newUser;
    }

    static async login({ username, password }) {
        const cleanUsername = Sanitizer.cleanInput(username);
        if (!cleanUsername || !password) {
            throw new Error('Username dan Password wajib diisi.');
        }

        const user = await UserRepo.findByUsername(cleanUsername);
        if (!user) {
            throw new Error('Username atau Password salah.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Username atau Password salah.');
        }

        return {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            no_hp: user.no_hp,
            alamat: user.alamat,
            role: user.role
        };
    }

    static async updateProfile(userId, { full_name, email, no_hp, alamat, password, confirm_password }) {
        const cleanFullName = Sanitizer.cleanInput(full_name);
        if (!cleanFullName) {
            throw new Error('Nama Lengkap tidak boleh kosong.');
        }

        let hashedPassword = null;
        if (password && password.trim() !== '') {
            if (password !== confirm_password) {
                throw new Error('Konfirmasi password baru tidak cocok.');
            }
            if (password.length < 6) {
                throw new Error('Password baru minimal 6 karakter.');
            }
            hashedPassword = await bcrypt.hash(password, 10);
        }

        await UserRepo.updateProfile(userId, {
            full_name: cleanFullName,
            email: Sanitizer.cleanInput(email),
            no_hp: Sanitizer.cleanInput(no_hp),
            alamat: Sanitizer.cleanInput(alamat),
            password: hashedPassword
        });

        return await UserRepo.findById(userId);
    }
}

module.exports = AuthService;
