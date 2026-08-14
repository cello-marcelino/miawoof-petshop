/**
 * Reusable Footer Component
 */
function renderFooter() {
    return `
    <footer class="bg-white border-top mt-auto py-5">
        <div class="container">
            <div class="row g-4">
                <div class="col-lg-4 col-md-6">
                    <div class="d-flex align-items-center gap-2 mb-3">
                        <span class="font-brand text-primary" style="font-size: 2rem;">MiaWoof</span>
                        <span class="badge bg-light text-dark rounded-pill border px-2 py-1">Petshop & Spa</span>
                    </div>
                    <p class="text-muted small mb-3">
                        Pusat perawatan dan penyedia kebutuhan nutrisi hewan peliharaan terbaik. Kami mengutamakan kenyamanan, kebersihan, dan kesehatan anabul kesayangan Anda.
                    </p>
                    <div class="d-flex gap-2">
                        <span class="badge bg-light text-dark border p-2">📍 Jakarta, Indonesia</span>
                        <span class="badge bg-light text-dark border p-2">🕒 Buka: 09:00 - 20:00</span>
                    </div>
                </div>

                <div class="col-lg-2 col-md-6">
                    <h6 class="fw-bold mb-3 text-dark">Layanan Kami</h6>
                    <ul class="list-unstyled small d-flex flex-column gap-2 text-muted">
                        <li><a href="/produk?kategori=kucing" class="text-decoration-none text-muted">Makanan Kucing</a></li>
                        <li><a href="/produk?kategori=anjing" class="text-decoration-none text-muted">Makanan Anjing</a></li>
                        <li><a href="/grooming" class="text-decoration-none text-muted">Grooming Reguler</a></li>
                        <li><a href="/grooming" class="text-decoration-none text-muted">Grooming Spa Medicated</a></li>
                    </ul>
                </div>

                <div class="col-lg-2 col-md-6">
                    <h6 class="fw-bold mb-3 text-dark">Bantuan & Akun</h6>
                    <ul class="list-unstyled small d-flex flex-column gap-2 text-muted">
                        <li><a href="/riwayat-pesanan" class="text-decoration-none text-muted">Status Pesanan</a></li>
                        <li><a href="/riwayat-booking" class="text-decoration-none text-muted">Jadwal Booking</a></li>
                        <li><a href="/profil" class="text-decoration-none text-muted">Profil Saya</a></li>
                        <li><a href="/login" class="text-decoration-none text-muted">Masuk Petugas / Admin</a></li>
                    </ul>
                </div>

                <div class="col-lg-4 col-md-6">
                    <h6 class="fw-bold mb-3 text-dark">Kontak Petshop</h6>
                    <div class="card p-3 border-0 bg-light rounded-3 small">
                        <div class="fw-semibold text-dark mb-1">Customer Care MiaWoof:</div>
                        <div class="text-muted mb-2">WhatsApp: +62 812-3456-7890</div>
                        <div class="text-muted">Email: halo@miawoof.com</div>
                    </div>
                </div>
            </div>

            <div class="border-top mt-4 pt-4 d-flex flex-column flex-md-row align-items-center justify-content-between text-muted small">
                <div>&copy; ${new Date().getFullYear()} MiaWoof Petshop CMS. Refactored Native Architecture.</div>
                <div class="fw-semibold text-primary">Dibuat dengan ❤️ untuk Pecinta Hewan</div>
            </div>
        </div>
    </footer>
    `;
}

function initFooter() {
    const root = document.getElementById('footer-root');
    if (root) {
        root.innerHTML = renderFooter();
    }
}
