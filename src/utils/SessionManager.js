const crypto = require('crypto');
const cookie = require('cookie');

class SessionManager {
    constructor() {
        this.sessions = new Map(); // sessionToken -> { userId, username, role, full_name, createdAt }
        this.SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
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
        const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
        const sessionToken = cookies.session_token;
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
        const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
        const sessionToken = cookies.session_token;
        if (sessionToken && this.sessions.has(sessionToken)) {
            this.sessions.delete(sessionToken);
        }
    }

    attachSessionCookie(res, sessionToken) {
        res.setHeader('Set-Cookie', cookie.serialize('session_token', sessionToken, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24, // 1 day
            sameSite: 'lax'
        }));
    }

    clearSessionCookie(res) {
        res.setHeader('Set-Cookie', cookie.serialize('session_token', '', {
            httpOnly: true,
            path: '/',
            expires: new Date(0)
        }));
    }
}

module.exports = new SessionManager();
