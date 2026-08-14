/**
 * Rich Royal Blue & Sunny Yellow Neo-Brutalist Customer Footer Component
 */
function initFooter() {
    const footerRoot = document.getElementById('footer-root');
    if (!footerRoot) return;

    footerRoot.innerHTML = `
        <footer class="border-top border-2 border-dark pt-5 pb-4 mt-auto text-white" style="background-color: var(--accent-blue-dark) !important;">
            <div class="container">
                <div class="row g-4 mb-4">
                    <div class="col-lg-4 col-md-6">
                        <div class="d-flex align-items-center gap-2 mb-3">
                            <img src="/images/branding/logo.jpg" alt="MiaWoof Logo" width="44" height="44" class="rounded-2 border border-2 border-white" onerror="this.src='/images/icons/paw.svg'">
                            <span class="font-brand fs-3 text-warning fw-bold">MiaWoof Petshop</span>
                        </div>
                        <p class="text-light small mb-3 opacity-90">
                            Pusat perbelanjaan nutrisi anabul premium dan layanan perawatan salon grooming profesional berlisensi untuk kucing dan anjing kesayangan Anda.
                        </p>
                        <div class="d-flex gap-2 flex-wrap">
                            <span class="badge bg-yellow text-dark border border-1 border-dark px-3 py-1 fw-bold">Nutrisi Pilihan</span>
                            <span class="badge bg-white text-dark border border-1 border-dark px-3 py-1 fw-bold">Grooming Berlisensi</span>
                        </div>
                    </div>

                    <div class="col-lg-2 col-md-6">
                        <div class="footer-title-badge">Navigasi Utama</div>
                        <ul class="list-unstyled small mb-0 d-flex flex-column gap-2 mt-2">
                            <li><a href="/" class="text-white text-decoration-none fw-bold hover-warning">&rarr; Beranda</a></li>
                            <li><a href="/produk" class="text-white text-decoration-none fw-bold hover-warning">&rarr; Katalog Produk</a></li>
                            <li><a href="/grooming" class="text-white text-decoration-none fw-bold hover-warning">&rarr; Salon Grooming</a></li>
                            <li><a href="/riwayat-pesanan" class="text-white text-decoration-none fw-bold hover-warning">&rarr; Riwayat Pesanan</a></li>
                        </ul>
                    </div>

                    <div class="col-lg-3 col-md-6">
                        <div class="footer-title-badge">Layanan Grooming</div>
                        <ul class="list-unstyled small mb-0 d-flex flex-column gap-2 mt-2 text-light opacity-90">
                            <li>&bull; Spa Medicated Anti-Kutu</li>
                            <li>&bull; Treatment Jamur & Scabies</li>
                            <li>&bull; Styling & Haircut Anabul</li>
                            <li>&bull; Pembersihan Karang Gigi</li>
                        </ul>
                    </div>

                    <div class="col-lg-3 col-md-6">
                        <div class="footer-title-badge">Kontak & Lokasi</div>
                        <div class="d-flex flex-column gap-2 small text-light mt-2">
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-warning text-dark p-1 rounded-circle">&bull;</span>
                                <span class="fw-semibold">Ruko Pet Center No. 1, Jakarta</span>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-warning text-dark p-1 rounded-circle">&bull;</span>
                                <span class="fw-semibold">+62 812-3456-7890</span>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-warning text-dark p-1 rounded-circle">&bull;</span>
                                <span class="fw-semibold">Buka Setiap Hari: 08.00 - 20.00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pt-3 border-top border-1 border-secondary d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 text-center text-md-start">
                    <small class="text-light opacity-75 fw-bold">
                        &copy; 2026 <strong>MiaWoof Petshop System</strong>. Seluruh Hak Cipta Dilindungi.
                    </small>
                    <div>
                        <span class="badge bg-yellow text-dark border border-1 border-dark px-2 py-1 small fw-bold">Native Node.js</span>
                        <span class="badge bg-white text-dark border border-1 border-dark px-2 py-1 small fw-bold">Neo-Brutalism</span>
                    </div>
                </div>
            </div>
        </footer>
    `;
}
