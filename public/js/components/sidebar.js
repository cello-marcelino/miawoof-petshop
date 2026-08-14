/**
 * Clean Neo-Brutalist Admin Sidebar Component (Yellow Header & Blue Accents)
 */
function initSidebar(activeMenu = 'dashboard', user = null) {
    const sidebarRoot = document.getElementById('sidebar-root');
    if (!sidebarRoot) return;

    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', url: '/admin/dashboard', icon: '/images/icons/dashboard.svg' },
        { key: 'produk', label: 'Kelola Produk', url: '/admin/produk', icon: '/images/icons/cart.svg' },
        { key: 'pesanan', label: 'Kelola Pesanan', url: '/admin/pesanan', icon: '/images/icons/package.svg' },
        { key: 'grooming', label: 'Jadwal Grooming', url: '/admin/grooming', icon: '/images/icons/scissors.svg' },
        { key: 'users', label: 'Data Pengguna', url: '/admin/users', icon: '/images/icons/user.svg' },
        { key: 'profil', label: 'Pengaturan Profil', url: '/admin/profil', icon: '/images/icons/user.svg' }
    ];

    const menuLinksHtml = menuItems.map(item => {
        const isActive = activeMenu === item.key;
        return `
            <li class="nav-item mb-2">
                <a href="${item.url}" class="nav-link d-flex align-items-center gap-2 px-3 py-2 fw-bold rounded-2 text-decoration-none transition ${isActive ? 'bg-yellow text-dark border border-2 border-dark shadow-sm' : 'text-dark hover-bg-subtle'}">
                    <img src="${item.icon}" alt="${item.label}" width="18" height="18">
                    <span>${item.label}</span>
                </a>
            </li>
        `;
    }).join('');

    sidebarRoot.innerHTML = `
        <aside class="admin-sidebar p-3 d-flex flex-column justify-content-between">
            <div>
                <!-- Brand Header (Sunny Yellow Neo-Brutalist Box) -->
                <div class="d-flex align-items-center gap-2 p-2 mb-3 bg-yellow border border-2 border-dark rounded-2 shadow-sm">
                    <img src="/images/branding/logo.jpg" alt="MiaWoof Logo" width="38" height="38" class="rounded-2 border border-2 border-dark" onerror="this.src='/images/icons/paw.svg'">
                    <div>
                        <h6 class="font-brand fs-5 text-dark mb-0 fw-bold">MiaWoof</h6>
                        <span class="badge bg-blue text-white border border-1 border-dark px-2 py-0 fw-bold" style="font-size: 0.62rem; letter-spacing: 0.5px;">ADMIN PANEL</span>
                    </div>
                </div>

                <!-- Nav Items -->
                <ul class="nav flex-column">
                    ${menuLinksHtml}
                </ul>
            </div>

            <!-- Footer User Section -->
            <div class="pt-3 border-top border-2 border-dark">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                        <div class="bg-yellow text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold border border-2 border-dark" style="width: 34px; height: 34px; font-size: 0.85rem;">
                            ${(user && user.full_name ? user.full_name.charAt(0) : 'A').toUpperCase()}
                        </div>
                        <div style="line-height: 1.2;">
                            <div class="fw-bold text-dark text-truncate" style="max-width: 120px; font-size: 0.85rem;">${user ? user.full_name : 'Admin'}</div>
                            <span class="badge bg-blue text-white border border-1 border-dark rounded-pill py-0 px-2" style="font-size: 0.6rem;">Admin</span>
                        </div>
                    </div>
                    <button onclick="handleLogout()" class="btn btn-outline-custom btn-sm p-1 border-2 border-dark" title="Keluar">
                        <img src="/images/icons/logout.svg" alt="Logout" width="16" height="16">
                    </button>
                </div>
            </div>
        </aside>
    `;
}

async function handleLogout() {
    try {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            window.location.href = '/login?msg=Anda+telah+berhasil+keluar&status=info';
        }
    } catch (e) {
        window.location.href = '/login';
    }
}
