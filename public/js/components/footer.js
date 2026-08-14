/**
 * Clean Neo-Brutalist Customer Footer Component (SVG Icons)
 */
function initFooter() {
    const footerRoot = document.getElementById('footer-root');
    if (!footerRoot) return;

    footerRoot.innerHTML = `
        <footer class="bg-white border-top border-2 border-dark pt-5 pb-4 mt-auto">
            <div class="container">
                <div class="row g-4 mb-4">
                    <div class="col-lg-4 col-md-6">
                        <div class="d-flex align-items-center gap-2 mb-3">
                            <img src="/images/branding/logo.jpg" alt="MiaWoof Logo" width="40" height="40" class="rounded-2 border border-2 border-dark" onerror="this.src='/images/icons/paw.svg'">
                            <span class="font-brand fs-4 text-primary fw-bold">MiaWoof Petshop</span>
                        </div>
                        <p class="text-muted small mb-3">
                            Pusat perbelanjaan nutrisi anabul premium dan layanan perawatan salon grooming profesional berlisensi untuk kucing dan anjing kesayangan Anda.
                        </p>
                        <div class="d-flex gap-2">
                            <span class="badge bg-primary text-white border border-1 border-dark px-3 py-1 fw-bold">Kualitas Premium</span>
                            <span class="badge bg-white text-dark border border-1 border-dark px-3 py-1 fw-bold">Grooming Berlisensi</span>
                        </div>
                    </div>

                    <div class="col-lg-2 col-md-6">
                        <h6 class="fw-bold text-dark mb-3 text-uppercase" style="font-size: 0.85rem; letter-spacing: 0.5px;">Navigasi</h6>
                        <ul class="list-unstyled small mb-0 d-flex flex-column gap-2">
                            <li><a href="/" class="text-muted text-decoration-none fw-semibold hover-primary">&rarr; Beranda</a></li>
                            <li><a href="/produk" class="text-muted text-decoration-none fw-semibold hover-primary">&rarr; Katalog Produk</a></li>
                            <li><a href="/grooming" class="text-muted text-decoration-none fw-semibold hover-primary">&rarr; Salon Grooming</a></li>
                            <li><a href="/riwayat-pesanan" class="text-muted text-decoration-none fw-semibold hover-primary">&rarr; Riwayat Pesanan</a></li>
                        </ul>
                    </div>

                    <div class="col-lg-3 col-md-6">
                        <h6 class="fw-bold text-dark mb-3 text-uppercase" style="font-size: 0.85rem; letter-spacing: 0.5px;">Layanan Grooming</h6>
                        <ul class="list-unstyled small mb-0 d-flex flex-column gap-2">
                            <li class="text-muted fw-semibold">Spa Medicated Anti-Kutu</li>
                            <li class="text-muted fw-semibold">Treatment Jamur & Scabies</li>
                            <li class="text-muted fw-semibold">Styling & Haircut Anabul</li>
                            <li class="text-muted fw-semibold">Pembersihan Karang Gigi</li>
                        </ul>
                    </div>

                    <div class="col-lg-3 col-md-6">
                        <h6 class="fw-bold text-dark mb-3 text-uppercase" style="font-size: 0.85rem; letter-spacing: 0.5px;">Kontak & Lokasi</h6>
                        <div class="d-flex flex-column gap-2 small text-muted">
                            <div class="d-flex align-items-center gap-2">
                                <img src="/images/icons/map-pin.svg" alt="Lokasi" width="16" height="16">
                                <span>Ruko Pet Center No. 1, Jakarta Selatan</span>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <img src="/images/icons/phone.svg" alt="Phone" width="16" height="16">
                                <span>+62 812-3456-7890</span>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <img src="/images/icons/clock.svg" alt="Jam Operasional" width="16" height="16">
                                <span>Buka Setiap Hari: 08.00 - 20.00 WIB</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pt-3 border-top border-1 border-dark d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 text-center text-md-start">
                    <small class="text-muted fw-semibold">
                        &copy; 2026 <strong>MiaWoof Petshop System</strong>. Seluruh Hak Cipta Dilindungi.
                    </small>
                    <small class="text-muted">
                        Modern Native Node.js &bull; Neo-Brutalism UI Architecture
                    </small>
                </div>
            </div>
        </footer>
    `;
}
