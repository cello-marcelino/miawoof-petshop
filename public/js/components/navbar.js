/**
 * Ultra-Clean Neo-Brutalist Customer Navbar Component (3-Color Master System)
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
                <a class="nav-link d-inline-flex align-items-center gap-2 text-decoration-none fw-bold ${isActive ? 'nav-item-active' : 'nav-item-inactive'}" href="${item.url}">
                    <img src="${isActive ? item.iconDark : item.iconLight}" alt="${item.label}" width="16" height="16">
                    <span>${item.label}</span>
                </a>
            </li>
        `;
    }).join('');

    let authSectionHtml = '';
    if (user) {
        authSectionHtml = `
            <div class="d-flex align-items-center gap-2">
                <a href="/profil" class="d-flex align-items-center gap-2 text-dark text-decoration-none fw-bold px-3 py-1 bg-white border border-2 border-dark rounded-2" style="box-shadow: 2px 2px 0px #000000;">
                    <img src="/images/icons/user.svg" alt="User" width="16" height="16">
                    <span class="small">${user.full_name || user.username}</span>
                </a>
                <button onclick="handleLogout()" class="btn btn-outline-custom btn-sm py-1 px-3" title="Keluar">
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
        <style>
            .custom-navbar {
                background-color: var(--primary) !important;
                border-top: 4px solid var(--accent-yellow) !important;
                border-bottom: 3px solid #000000 !important;
                min-height: 72px;
            }
            .nav-brand-card {
                background-color: #ffffff;
                border: 2px solid #000000;
                box-shadow: 3px 3px 0px #000000;
                border-radius: 8px;
                padding: 4px 12px;
                transition: transform 0.1s ease;
            }
            .nav-brand-card:hover {
                transform: translate(-1px, -1px);
                box-shadow: 4px 4px 0px #000000;
            }
            .nav-item-active {
                background-color: var(--accent-yellow) !important;
                color: #000000 !important;
                border: 2px solid #000000 !important;
                box-shadow: 3px 3px 0px #000000 !important;
                border-radius: 6px !important;
                padding: 7px 16px !important;
            }
            .nav-item-inactive {
                color: #ffffff !important;
                border: 2px solid transparent !important;
                border-radius: 6px !important;
                padding: 7px 16px !important;
                transition: all 0.12s ease !important;
            }
            .nav-item-inactive:hover {
                background-color: rgba(255, 255, 255, 0.18) !important;
                color: #ffffff !important;
                border: 2px solid #000000 !important;
                box-shadow: 2px 2px 0px #000000 !important;
                transform: translate(-1px, -1px);
            }
        </style>
        <nav class="navbar navbar-expand-lg custom-navbar sticky-top py-2">
            <div class="container">
                <!-- Brand Logo Card -->
                <a class="navbar-brand d-flex align-items-center gap-2 nav-brand-card text-decoration-none m-0" href="/">
                    <img src="/images/branding/logo.jpg" alt="MiaWoof Logo" width="34" height="34" class="rounded-1 border border-1 border-dark" onerror="this.src='/images/icons/paw.svg'">
                    <span class="font-brand fs-4 text-dark fw-bold" style="line-height: 1;">MiaWoof</span>
                    <span class="badge bg-yellow text-dark border border-1 border-dark rounded-1 fw-bold px-2 py-0" style="font-size: 0.65rem; letter-spacing: 0.5px;">PETSHOP</span>
                </a>

                <!-- Mobile Toggle Button -->
                <button class="navbar-toggler border-2 border-dark bg-white" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <!-- Navbar Menu & Actions -->
                <div class="collapse navbar-collapse mt-3 mt-lg-0" id="navbarContent">
                    <ul class="navbar-nav mx-auto mb-2 mb-lg-0 gap-2 align-items-center">
                        ${navLinksHtml}
                    </ul>
                    <div class="d-flex justify-content-center justify-content-lg-end mt-2 mt-lg-0">
                        ${authSectionHtml}
                    </div>
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
