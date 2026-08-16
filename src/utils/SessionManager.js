const crypto = require('crypto');
 
class SessionManager {
    constructor() {
        this.sessions = new Map(); // sessionToken -> { userId, username, role, full_name, createdAt }
        this.SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
    }

    _parseCookieToken(cookieHeader) {
        if (!cookieHeader) return null;
        const match = cookieHeader.match(/(?:^|;\s*)session_token=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : null;
    }

    createSession(user) {
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const sessionData = {
            userId: user.id,
            username: user.username,
            role: user.role,
            full_name: user.full_name,
            email: user.email,
            createdAt: Date.now()
        };
        this.sessions.set(sessionToken, sessionData);
        return sessionToken;
    }

    getSession(req) {
        const sessionToken = this._parseCookieToken(req.headers.cookie);
        if (!sessionToken || !this.sessions.has(sessionToken)) {
            return null;
        }
        
        const sessionData = this.sessions.get(sessionToken);
        // Check expiry
        if (Date.now() - sessionData.createdAt > this.SESSION_EXPIRY_MS) {
            this.sessions.delete(sessionToken);
            return null;
        }
        return sessionData;
    }

    destroySession(req) {
        const sessionToken = this._parseCookieToken(req.headers.cookie);
        if (sessionToken && this.sessions.has(sessionToken)) {
            this.sessions.delete(sessionToken);
        }
    }

    attachSessionCookie(res, sessionToken) {
        res.setHeader('Set-Cookie', `session_token=${encodeURIComponent(sessionToken)}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`);
    }

    clearSessionCookie(res) {
        res.setHeader('Set-Cookie', 'session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');
    }

    requireAuth(req, res, customMsg = 'Silakan login terlebih dahulu.') {
        const session = this.getSession(req);
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: customMsg }));
            return null;
        }
        return session;
    }

    requireAdmin(req, res, customMsg = 'Akses ditolak: Hanya Admin.') {
        const session = this.getSession(req);
        if (!session || session.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: customMsg }));
            return null;
        }
        return session;
    }
}

module.exports = new SessionManager();
