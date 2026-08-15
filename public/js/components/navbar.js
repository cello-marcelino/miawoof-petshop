/**
 * Pixel-Perfect Neo-Brutalist Customer Navbar Component (3-Color Master System)
 */
function initNavbar(activePage = 'home', user = null) {
    const navbarRoot = document.getElementById('navbar-root');
    if (!navbarRoot) return;

    const navItems = [
        { key: 'home', label: 'Beranda', url: '/', iconDark: '/images/icons/paw.svg', iconLight: '/images/icons/paw-white.svg' },
        { key: 'produk', label: 'Katalog Produk', url: '/produk', iconDark: '/images/icons/cart.svg', iconLight: '/images/icons/cart-white.svg' },
        { key: 'grooming', label: 'Salon & Grooming', url: '/grooming', iconDark: '/images/icons/scissors.svg', iconLight: '/images/icons/scissors-white.svg' }
    ];

    if (user && user.role === 'customer') {
        navItems.push(
            { key: 'pesanan', label: 'Pesanan Saya', url: '/riwayat-pesanan', iconDark: '/images/icons/package.svg', iconLight: '/images/icons/package-white.svg' },
            { key: 'booking', label: 'Jadwal Grooming', url: '/riwayat-booking', iconDark: '/images/icons/calendar.svg', iconLight: '/images/icons/calendar-white.svg' }
        );
    }

    const navLinksHtml = navItems.map(item => {
        const isActive = activePage === item.key;
        return `
            <li class="nav-item">
                <a class="header-nav-link ${isActive ? 'active' : ''}" href="${item.url}">
                    <img src="${isActive ? item.iconDark : item.iconLight}" alt="${item.label}" width="16" height="16">
                    <span>${item.label}</span>
                </a>
            </li>
        `;
    }).join('');

    let authSectionHtml = '';
    let mobileAuthHtml = '';

    if (user) {
        if (user.role === 'admin') {
            authSectionHtml = `
                <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-yellow text-dark border border-2 border-dark px-2 py-1 fw-bold" style="font-size: 0.72rem; box-shadow: 2px 2px 0px #000;">
                        ⚡ Mode Admin
                    </span>
                    <a href="/admin/dashboard" class="btn btn-yellow-custom btn-sm px-3 fw-bold" style="height: 38px;" title="Kembali ke Dashboard Manajemen Admin">
                        <span>Panel Admin &rarr;</span>
                    </a>
                    <a href="/admin/profil" class="header-user-pill" title="Profil Administrator">
                        <img src="/images/icons/user.svg" alt="Admin" width="16" height="16">
                        <span class="d-none d-xl-inline">${user.full_name || 'Admin'}</span>
                    </a>
                    <button onclick="handleLogout()" class="btn btn-outline-custom btn-sm" title="Keluar dari Akun" style="height: 38px; padding: 0 12px;">
                        <img src="/images/icons/logout.svg" alt="Logout" width="16" height="16">
                    </button>
                </div>
            `;

            mobileAuthHtml = `
                <div class="d-flex flex-column gap-2">
                    <a href="/admin/dashboard" class="btn btn-yellow-custom w-100 justify-content-center py-2 fw-bold">
                        <span>⚡ Buka Dashboard Admin &rarr;</span>
                    </a>
                    <div class="d-flex gap-2">
                        <a href="/admin/profil" class="header-user-pill flex-fill justify-content-center" style="height: 38px;">
                            <img src="/images/icons/user.svg" alt="Admin" width="16" height="16">
                            <span>Profil Admin</span>
                        </a>
                        <button onclick="handleLogout()" class="btn btn-danger-custom flex-fill justify-content-center" style="height: 38px;">
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            `;
        } else {
            authSectionHtml = `
                <div class="d-flex align-items-center gap-2">
                    <a href="/profil" class="header-user-pill" title="Profil Saya">
                        <img src="/images/icons/user.svg" alt="User" width="16" height="16">
                        <span>${user.full_name || user.username}</span>
                    </a>
                    <button onclick="handleLogout()" class="btn btn-outline-custom btn-sm" title="Keluar" style="height: 38px; padding: 0 12px;">
                        <img src="/images/icons/logout.svg" alt="Logout" width="16" height="16">
                    </button>
                </div>
            `;

            mobileAuthHtml = `
                <div class="d-flex gap-2">
                    <a href="/profil" class="header-user-pill flex-fill justify-content-center" style="height: 38px;">
                        <img src="/images/icons/user.svg" alt="User" width="16" height="16">
                        <span>Profil Saya</span>
                    </a>
                    <button onclick="handleLogout()" class="btn btn-outline-custom flex-fill justify-content-center" style="height: 38px;">
                        <span>Keluar</span>
                    </button>
                </div>
            `;
        }
    } else {
        authSectionHtml = `
            <div class="d-flex align-items-center gap-2">
                <a href="/login" class="btn btn-outline-custom btn-sm px-3">Masuk</a>
                <a href="/register" class="btn btn-yellow-custom btn-sm px-3">Daftar</a>
            </div>
        `;

        mobileAuthHtml = `
            <div class="d-flex gap-2">
                <a href="/login" class="btn btn-outline-custom flex-fill justify-content-center py-2">Masuk</a>
                <a href="/register" class="btn btn-yellow-custom flex-fill justify-content-center py-2">Daftar</a>
            </div>
        `;
    }

    navbarRoot.innerHTML = `
        <header class="main-header">
            <div class="container">
                <div class="header-container py-2">
                    <!-- 1. Left: Brand Logo Card -->
                    <a class="brand-wrapper" href="/">
                        <img src="/images/branding/logo.jpg" alt="MiaWoof Petshop Logo" width="34" height="34" class="rounded-1 border border-1 border-dark" onerror="this.src='/images/icons/paw.svg'">
                        <span class="brand-title">MiaWoof Petshop</span>
                    </a>

                    <!-- 2. Center: Navigation Menu Links -->
                    <nav class="d-none d-lg-block">
                        <ul class="header-nav-list">
                            ${navLinksHtml}
                        </ul>
                    </nav>

                    <!-- 3. Right: Auth Actions -->
                    <div class="d-none d-lg-block">
                        ${authSectionHtml}
                    </div>

                    <!-- 4. Mobile Toggle Button -->
                    <button class="btn btn-outline-custom d-lg-none p-2" type="button" data-bs-toggle="collapse" data-bs-target="#mobileNavCollapse" aria-expanded="false" style="height: 38px;">
                        <img src="/images/icons/paw.svg" alt="Menu" width="18" height="18">
                    </button>
                </div>

                <!-- Mobile Collapse Navigation -->
                <div class="collapse d-lg-none pb-3 pt-2 border-top border-1 border-dark" id="mobileNavCollapse">
                    <ul class="d-flex flex-column gap-2 list-unstyled mb-3">
                        ${navLinksHtml}
                    </ul>
                    <div class="pt-2 border-top border-1 border-dark">
                        ${mobileAuthHtml}
                    </div>
                </div>
            </div>
        </header>
    `;
}

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
