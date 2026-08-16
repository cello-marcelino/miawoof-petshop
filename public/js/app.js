/**
 * Global Frontend Orchestrator for MiaWoof Petshop
 */

document.addEventListener('DOMContentLoaded', () => {
    // Automatically catch flash messages from URL parameters (e.g. ?msg=Pesanan+berhasil&status=success)
    const params = new URLSearchParams(window.location.search);
    if (params.has('msg') || params.has('message')) {
        const msg = params.get('msg') || params.get('message');
        const status = params.get('status') || 'success';
        
        if (typeof showToast === 'function') {
            showToast(decodeURIComponent(msg), status);
        }
        
        // Clean URL query without page reloading
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

/**
 * Global Logout Handler
 */
async function handleLogout() {
    try {
        const res = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        window.location.href = data.redirectUrl || '/login?msg=Anda+telah+berhasil+keluar&status=info';
    } catch (e) {
        window.location.href = '/logout';
    }
}
