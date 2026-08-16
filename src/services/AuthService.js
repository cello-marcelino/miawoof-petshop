const crypto = require('crypto');
const UserRepo = require('../repositories/UserRepo');

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
    if (!storedPassword) return false;
    if (storedPassword.includes(':')) {
        const [salt, hash] = storedPassword.split(':');
        const candidateHash = crypto.scryptSync(password, salt, 64).toString('hex');
        try {
            return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(candidateHash, 'hex'));
        } catch {
            return false;
        }
    }
    return password === storedPassword;
}

class AuthService {
    static hashPassword(password) {
        return hashPassword(password);
    }

    static verifyPassword(password, storedPassword) {
        return verifyPassword(password, storedPassword);
    }

    static async register({ username, password, confirm_password, full_name, email, no_hp, alamat }) {
        const cleanUsername = username ? String(username).trim() : '';
        const cleanFullName = full_name ? String(full_name).trim() : '';

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

        // Hash password with native crypto
        const hashedPassword = hashPassword(password);

        // ALWAYS force role to 'customer' for security (Prevents privilege escalation)
        const newUser = await UserRepo.createCustomer({
            username: cleanUsername,
            password: hashedPassword,
            full_name: cleanFullName,
            email: email ? String(email).trim() : '',
            no_hp: no_hp ? String(no_hp).trim() : '',
            alamat: alamat ? String(alamat).trim() : ''
        });

        return newUser;
    }

    static async login({ username, password }) {
        const cleanUsername = username ? String(username).trim() : '';
        if (!cleanUsername || !password) {
            throw new Error('Username dan Password wajib diisi.');
        }

        const user = await UserRepo.findByUsername(cleanUsername);
        if (!user) {
            throw new Error('Username atau Password salah.');
        }

        const isMatch = verifyPassword(password, user.password);
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
        const cleanFullName = full_name ? String(full_name).trim() : '';
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
            hashedPassword = hashPassword(password);
        }

        await UserRepo.updateProfile(userId, {
            full_name: cleanFullName,
            email: email ? String(email).trim() : '',
            no_hp: no_hp ? String(no_hp).trim() : '',
            alamat: alamat ? String(alamat).trim() : '',
            password: hashedPassword
        });

        return await UserRepo.findById(userId);
    }
}

module.exports = AuthService;
