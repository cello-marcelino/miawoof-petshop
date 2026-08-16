/**
 * Clean Neo-Brutalist Admin Sidebar Component (3-Color Master System)
 */
function initSidebar(activeMenu = 'dashboard', user = null) {
    const sidebarRoot = document.getElementById('sidebar-root');
    if (!sidebarRoot) return;

    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', url: '/admin/dashboard', icon: '/images/icons/dashboard.svg' },
        { key: 'pesanan', label: 'Kelola Pesanan', url: '/admin/pesanan', icon: '/images/icons/package.svg' },
        { key: 'grooming', label: 'Salon & Grooming', url: '/admin/grooming', icon: '/images/icons/scissors.svg' },
        { key: 'produk', label: 'Kelola Produk', url: '/admin/produk', icon: '/images/icons/cart.svg' },
        { key: 'sliders', label: 'Kelola Slider CMS', url: '/admin/sliders', icon: '/images/icons/calendar.svg' },
        { key: 'users', label: 'Data Pengguna', url: '/admin/users', icon: '/images/icons/user.svg' },
        { key: 'profil', label: 'Pengaturan Profil', url: '/admin/profil', icon: '/images/icons/user.svg' }
    ];

    const menuLinksHtml = menuItems.map(item => {
        const isActive = activeMenu === item.key;
        return `
            <li class="nav-item mb-2">
                <a href="${item.url}" class="nav-link d-flex align-items-center gap-2 px-3 py-2 fw-bold rounded-2 text-decoration-none transition ${isActive ? 'bg-yellow text-dark border border-2 border-dark shadow-sm' : 'text-dark hover-bg-subtle'}" style="${isActive ? 'box-shadow: 3px 3px 0px #000000 !important;' : ''}">
                    <img src="${item.icon}" alt="${item.label}" width="18" height="18">
                    <span>${item.label}</span>
                </a>
            </li>
        `;
    }).join('');

    sidebarRoot.innerHTML = `
        <div id="admin-sidebar-backdrop" class="admin-sidebar-backdrop" onclick="toggleAdminSidebar()"></div>
        <aside id="admin-sidebar" class="admin-sidebar p-3 d-flex flex-column justify-content-between">
            <div>
                <!-- Brand Header Box with Unified Logo and Brand Title -->
                <div class="d-flex align-items-center justify-content-between mb-3">
                    <a href="/admin/dashboard" class="d-flex align-items-center gap-2 p-2 bg-primary border border-2 border-dark rounded-2 shadow-sm text-decoration-none flex-fill me-1" style="box-shadow: 3px 3px 0px #000000 !important;">
                        <img src="/images/branding/logo.jpg" alt="MiaWoof Petshop Logo" width="34" height="34" class="rounded-1 border border-1 border-white" onerror="this.src='/images/icons/paw.svg'">
                        <div>
                            <div class="brand-title fs-5 text-white fw-bold" style="line-height: 1.1;">MiaWoof Petshop</div>
                            <span class="badge bg-yellow text-dark border border-1 border-dark px-2 py-0 fw-bold d-block mt-1" style="font-size: 0.62rem; width: fit-content;">ADMIN PANEL</span>
                        </div>
                    </a>
                    <button class="btn btn-outline-custom btn-sm p-2 d-lg-none border-2 border-dark" onclick="toggleAdminSidebar()" title="Tutup Menu">
                        <span class="fw-bold fs-6">&times;</span>
                    </button>
                </div>

                <!-- Quick Link to Customer Website -->
                <a href="/" class="btn btn-outline-custom w-100 justify-content-center py-1 mb-3 text-dark fw-bold border-2 border-dark" style="font-size: 0.8rem; background-color: var(--primary-light);">
                    <span>🌐 Buka Toko Online &rarr;</span>
                </a>

                <!-- Nav Items -->
                <ul class="nav flex-column">
                    ${menuLinksHtml}
                </ul>
            </div>

            <!-- Footer User Section -->
            <div class="pt-3 border-top border-2 border-dark mt-3">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                        <div class="bg-yellow text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold border border-2 border-dark" style="width: 34px; height: 34px; font-size: 0.85rem; box-shadow: 2px 2px 0px #000000;">
                            ${(user && user.full_name ? user.full_name.charAt(0) : 'A').toUpperCase()}
                        </div>
                        <div style="line-height: 1.2;">
                            <div class="fw-bold text-dark text-truncate" style="max-width: 110px; font-size: 0.85rem;">${user ? user.full_name : 'Admin'}</div>
                            <span class="badge bg-primary text-white border border-1 border-dark rounded-pill py-0 px-2" style="font-size: 0.6rem;">Admin</span>
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

function toggleAdminSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    const backdrop = document.getElementById('admin-sidebar-backdrop');
    if (sidebar) sidebar.classList.toggle('show');
    if (backdrop) backdrop.classList.toggle('show');
}
