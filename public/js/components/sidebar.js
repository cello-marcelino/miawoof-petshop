/**
 * Reusable Admin Sidebar Component
 * @param {string} activeMenu - The active menu item ('dashboard', 'produk', 'pesanan', 'grooming', 'users', 'profil')
 * @param {object} user - Admin user object
 */
function renderAdminSidebar(activeMenu = 'dashboard', user = null) {
    const adminName = user ? user.full_name : 'Administrator';

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard Analitik', href: '/admin/dashboard', icon: '📊' },
        { id: 'produk', label: 'Kelola Produk', href: '/admin/produk', icon: '📦' },
        { id: 'pesanan', label: 'Kelola Pesanan', href: '/admin/pesanan', icon: '🛒' },
        { id: 'grooming', label: 'Jadwal Grooming', href: '/admin/grooming', icon: '✂️' },
        { id: 'users', label: 'Data Pengguna', href: '/admin/users', icon: '👥' },
        { id: 'profil', label: 'Profil Saya', href: '/admin/profil', icon: '👤' }
    ];

    const navLinksHtml = menuItems.map(item => {
        const isActive = activeMenu === item.id;
        return `
            <a href="${item.href}" class="d-flex align-items-center gap-3 px-3 py-3 rounded text-decoration-none fw-semibold mb-1 transition-all ${isActive ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'}" style="font-size: 0.95rem;">
                <span style="font-size: 1.2rem;">${item.icon}</span>
                <span>${item.label}</span>
            </a>
        `;
    }).join('');

    return `
    <div class="admin-sidebar p-3 d-flex flex-column justify-content-between">
        <div>
            <!-- Brand Header -->
            <div class="d-flex align-items-center gap-2 px-3 py-3 border-bottom mb-3">
                <span class="font-brand text-primary" style="font-size: 1.8rem;">MiaWoof</span>
                <span class="badge bg-danger rounded-pill px-2 py-1" style="font-size: 0.65rem; font-weight: 700;">ADMIN</span>
            </div>

            <!-- Navigation Links -->
            <nav class="d-flex flex-column">
                ${navLinksHtml}
            </nav>
        </div>

        <!-- Footer / User Info -->
        <div class="border-top pt-3">
            <div class="d-flex align-items-center justify-content-between px-2">
                <div class="d-flex align-items-center gap-2 overflow-hidden">
                    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 36px; height: 36px; font-weight: bold;">
                        ${adminName.charAt(0).toUpperCase()}
                    </div>
                    <div class="overflow-hidden">
                        <div class="fw-bold text-dark text-truncate" style="font-size: 0.85rem;">${adminName}</div>
                        <div class="text-muted" style="font-size: 0.75rem;">Super Admin</div>
                    </div>
                </div>
                <a href="/logout" class="btn btn-outline-danger btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0" title="Logout" style="width: 32px; height: 32px;">
                    🚪
                </a>
            </div>
        </div>
    </div>
    `;
}

// Auto injection helper
function initSidebar(activeMenu = 'dashboard', user = null) {
    const root = document.getElementById('sidebar-root');
    if (root) {
        root.innerHTML = renderAdminSidebar(activeMenu, user);
    }
}
