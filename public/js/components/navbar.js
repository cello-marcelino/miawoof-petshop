/**
 * Clean Neo-Brutalist Customer Navbar Component (Off-White, Blue & Yellow Palette)
 */
function initNavbar(activePage = 'home', user = null) {
    const navbarRoot = document.getElementById('navbar-root');
    if (!navbarRoot) return;

    const navItems = [
        { key: 'home', label: 'Beranda', url: '/', icon: '/images/icons/paw.svg' },
        { key: 'produk', label: 'Katalog Produk', url: '/produk', icon: '/images/icons/cart.svg' },
        { key: 'grooming', label: 'Salon & Grooming', url: '/grooming', icon: '/images/icons/scissors.svg' }
    ];

    if (user && user.role === 'customer') {
        navItems.push(
            { key: 'pesanan', label: 'Pesanan Saya', url: '/riwayat-pesanan', icon: '/images/icons/package.svg' },
            { key: 'booking', label: 'Jadwal Grooming', url: '/riwayat-booking', icon: '/images/icons/calendar.svg' }
        );
    }

    const navLinksHtml = navItems.map(item => {
        const isActive = activePage === item.key;
        return `
            <li class="nav-item">
                <a class="nav-link px-3 py-2 fw-bold d-flex align-items-center gap-2 rounded-2 text-decoration-none ${isActive ? 'bg-yellow text-dark border border-2 border-dark shadow-sm' : 'text-dark hover-bg-subtle'}" href="${item.url}" style="transition: all 0.15s ease;">
                    <img src="${item.icon}" alt="${item.label}" width="16" height="16">
                    <span>${item.label}</span>
                </a>
            </li>
        `;
    }).join('');

    let authSectionHtml = '';
    if (user) {
        authSectionHtml = `
            <div class="d-flex align-items-center gap-2">
                <a href="/profil" class="d-flex align-items-center gap-2 text-dark text-decoration-none fw-bold px-3 py-1 bg-white border border-2 border-dark rounded-2 shadow-sm">
                    <img src="/images/icons/user.svg" alt="User" width="16" height="16">
                    <span class="small">${user.full_name || user.username}</span>
                </a>
                <button onclick="handleLogout()" class="btn btn-outline-custom btn-sm py-1 px-3">
                    <img src="/images/icons/logout.svg" alt="Logout" width="14" height="14">
                    <span>Keluar</span>
                </button>
            </div>
        `;
    } else {
        authSectionHtml = `
            <div class="d-flex align-items-center gap-2">
                <a href="/login" class="btn btn-outline-custom btn-sm px-3 py-1">Masuk</a>
                <a href="/register" class="btn btn-yellow-custom btn-sm px-3 py-1">Daftar</a>
            </div>
        `;
    }

    navbarRoot.innerHTML = `
        <nav class="navbar navbar-expand-lg bg-white border-bottom border-2 border-dark sticky-top py-2" style="border-top: 4px solid var(--accent-yellow) !important;">
            <div class="container">
                <a class="navbar-brand d-flex align-items-center gap-2" href="/">
                    <img src="/images/branding/logo.jpg" alt="MiaWoof Logo" width="38" height="38" class="rounded-2 border border-2 border-dark" onerror="this.src='/images/icons/paw.svg'">
                    <span class="font-brand fs-4 text-primary fw-bold" style="line-height: 1;">MiaWoof</span>
                    <span class="badge bg-yellow text-dark border border-1 border-dark rounded-1 fw-bold px-2 py-0" style="font-size: 0.65rem;">PETSHOP</span>
                </a>

                <button class="navbar-toggler border-2 border-dark" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarContent">
                    <ul class="navbar-nav mx-auto mb-2 mb-lg-0 gap-1">
                        ${navLinksHtml}
                    </ul>
                    ${authSectionHtml}
                </div>
            </div>
        </nav>
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
