/**
 * Reusable Customer Navbar Component
 * @param {string} activePage - The currently active navigation key ('home', 'produk', 'grooming', 'pesanan', 'booking', 'profil')
 * @param {object} user - Current logged-in user object { full_name, role } or null
 */
function renderCustomerNavbar(activePage = 'home', user = null) {
    const isAuth = !!user;
    const userName = user ? user.full_name : '';
    
    return `
    <header class="sticky-top shadow-sm" style="z-index: 1020;">
        <!-- Top Main Brand Bar -->
        <nav class="navbar navbar-expand-lg" style="background-color: var(--primary); padding: 0.75rem 2rem;">
            <div class="container-fluid">
                <a class="navbar-brand d-flex align-items-center gap-2" href="/" style="color: #ffffff; text-decoration: none;">
                    <span class="font-brand" style="font-size: 1.8rem; letter-spacing: 1px;">MiaWoof</span>
                    <span class="badge bg-light text-dark rounded-pill px-2 py-1" style="font-size: 0.7rem; font-weight: 700;">Petshop & Grooming</span>
                </a>

                <button class="navbar-toggler border-0 text-white" type="button" data-bs-toggle="collapse" data-bs-target="#customerNavbar" aria-controls="customerNavbar" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon" style="filter: invert(1);"></span>
                </button>

                <div class="collapse navbar-collapse" id="customerNavbar">
                    <ul class="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-3">
                        <li class="nav-item">
                            <a class="nav-link text-white fw-semibold px-3 py-2 rounded ${activePage === 'home' ? 'bg-white text-dark shadow-sm' : 'opacity-75'}" href="/">Beranda</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white fw-semibold px-3 py-2 rounded ${activePage === 'produk' ? 'bg-white text-dark shadow-sm' : 'opacity-75'}" href="/produk">Katalog Produk</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white fw-semibold px-3 py-2 rounded ${activePage === 'grooming' ? 'bg-white text-dark shadow-sm' : 'opacity-75'}" href="/grooming">Paket Grooming</a>
                        </li>
                        ${isAuth ? `
                        <li class="nav-item">
                            <a class="nav-link text-white fw-semibold px-3 py-2 rounded ${activePage === 'pesanan' ? 'bg-white text-dark shadow-sm' : 'opacity-75'}" href="/riwayat-pesanan">Pesanan Saya</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white fw-semibold px-3 py-2 rounded ${activePage === 'booking' ? 'bg-white text-dark shadow-sm' : 'opacity-75'}" href="/riwayat-booking">Booking Saya</a>
                        </li>
                        ` : ''}
                    </ul>

                    <div class="d-flex align-items-center gap-2">
                        ${isAuth ? `
                            <a href="/profil" class="btn btn-light rounded-pill px-3 py-1 d-flex align-items-center gap-2 text-decoration-none shadow-sm ${activePage === 'profil' ? 'border border-2 border-dark' : ''}">
                                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 28px; height: 28px; font-size: 0.8rem; font-weight: bold;">
                                    ${userName.charAt(0).toUpperCase()}
                                </div>
                                <span class="fw-bold text-dark" style="font-size: 0.9rem;">${userName.split(' ')[0]}</span>
                            </a>
                            <a href="/logout" class="btn btn-outline-light rounded-pill px-3 py-1 fw-semibold" style="font-size: 0.9rem;">Logout</a>
                        ` : `
                            <a href="/login" class="btn btn-light rounded-pill px-3 py-1 fw-bold text-primary shadow-sm" style="font-size: 0.9rem;">Login</a>
                            <a href="/register" class="btn btn-outline-light rounded-pill px-3 py-1 fw-semibold" style="font-size: 0.9rem;">Daftar</a>
                        `}
                    </div>
                </div>
            </div>
        </nav>
    </header>
    `;
}

// Auto injection helper
function initNavbar(activePage = 'home', user = null) {
    const root = document.getElementById('navbar-root');
    if (root) {
        root.innerHTML = renderCustomerNavbar(activePage, user);
    }
}
