/**
 * Clean Neo-Brutalist Admin Sidebar Component (SVG Icons)
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

    const menuLinksHtml = menuItems.map(item => `
        <li class="nav-item mb-1">
            <a href="${item.url}" class="nav-link d-flex align-items-center gap-2 px-3 py-2 fw-bold rounded-2 text-decoration-none transition ${activeMenu === item.key ? 'bg-primary text-white border border-2 border-dark shadow-sm' : 'text-dark hover-bg-subtle'}">
                <img src="${item.icon}" alt="${item.label}" width="16" height="16" style="${activeMenu === item.key ? 'filter: brightness(0) invert(1);' : ''}">
                <span>${item.label}</span>
            </a>
        </li>
    `).join('');

    sidebarRoot.innerHTML = `
        <aside class="admin-sidebar p-3 d-flex flex-column justify-content-between">
            <div>
                <!-- Brand Header -->
                <div class="d-flex align-items-center gap-2 pb-3 mb-3 border-bottom border-2 border-dark">
                    <img src="/images/branding/logo.jpg" alt="MiaWoof Logo" width="36" height="36" class="rounded-2 border border-2 border-dark" onerror="this.src='/images/icons/paw.svg'">
                    <div>
                        <h6 class="font-brand fs-5 text-primary mb-0 fw-bold">MiaWoof</h6>
                        <small class="text-muted fw-bold text-uppercase" style="font-size: 0.65rem; letter-spacing: 0.5px;">Admin Control</small>
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
                        <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold border border-1 border-dark" style="width: 32px; height: 32px; font-size: 0.8rem;">
                            ${(user && user.full_name ? user.full_name.charAt(0) : 'A').toUpperCase()}
                        </div>
                        <div style="line-height: 1.2;">
                            <div class="fw-bold text-dark text-truncate" style="max-width: 120px; font-size: 0.85rem;">${user ? user.full_name : 'Admin'}</div>
                            <span class="badge bg-danger rounded-pill py-0 px-2" style="font-size: 0.6rem;">Admin</span>
                        </div>
                    </div>
                    <button onclick="handleLogout()" class="btn btn-outline-danger btn-sm p-1 border-2 border-dark" title="Keluar">
                        <img src="/images/icons/logout.svg" alt="Logout" width="14" height="14">
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
