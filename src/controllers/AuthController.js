const AuthService = require('../services/AuthService');
const SessionManager = require('../utils/SessionManager');

class AuthController {
    static async handleLogin(req, res, body) {
        try {
            const user = await AuthService.login(body);
            const token = SessionManager.createSession(user);
            SessionManager.attachSessionCookie(res, token);

            // Redirect target based on role
            const redirectUrl = user.role === 'admin' ? '/admin/dashboard' : '/';
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: 'Login berhasil!', 
                user, 
                redirect: redirectUrl 
            }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleRegister(req, res, body) {
        try {
            const newUser = await AuthService.register(body);
            
            // Auto login upon successful registration
            const token = SessionManager.createSession(newUser);
            SessionManager.attachSessionCookie(res, token);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: 'Registrasi akun berhasil! Selamat datang di MiaWoof.', 
                user: newUser,
                redirect: '/'
            }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleLogout(req, res) {
        SessionManager.destroySession(req);
        SessionManager.clearSessionCookie(res);

        const isJson = req.headers['content-type'] === 'application/json' || 
                       (req.headers.accept && req.headers.accept.includes('application/json')) ||
                       req.url.startsWith('/api/');

        if (isJson) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ 
                success: true, 
                message: 'Anda telah berhasil keluar.', 
                redirectUrl: '/login?msg=Anda+telah+berhasil+keluar&status=info' 
            }));
        }

        res.writeHead(302, { 'Location': '/login?msg=Anda+telah+berhasil+keluar&status=info' });
        res.end();
    }

    static async handleGetSession(req, res) {
        const session = SessionManager.getSession(req);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ authenticated: !!session, user: session }));
    }

    static async handleUpdateProfile(req, res, body) {
        const session = SessionManager.getSession(req);
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Silakan login terlebih dahulu.' }));
        }

        try {
            const updatedUser = await AuthService.updateProfile(session.userId, body);
            // Update session data
            session.full_name = updatedUser.full_name;
            session.email = updatedUser.email;

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Profil berhasil diperbarui.', user: updatedUser }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }
}

module.exports = AuthController;
