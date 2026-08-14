/**
 * 3-Color Neo-Brutalist Customer Footer Component
 */
function initFooter() {
    const footerRoot = document.getElementById('footer-root');
    if (!footerRoot) return;

    footerRoot.innerHTML = `
        <footer class="pt-5 pb-4 mt-auto text-white" style="background-color: var(--primary-dark) !important; border-top: 3px solid #000000 !important;">
            <div class="container">
                <div class="row g-4 mb-4">
                    <div class="col-lg-4 col-md-6">
                        <div class="d-inline-flex align-items-center gap-2 mb-3 bg-white p-2 rounded-2 border border-2 border-dark" style="box-shadow: 3px 3px 0px #000000;">
                            <img src="/images/branding/logo.jpg" alt="MiaWoof Petshop Logo" width="36" height="36" class="rounded-1 border border-1 border-dark" onerror="this.src='/images/icons/paw.svg'">
                            <span class="brand-title fs-4 text-dark fw-bold">MiaWoof Petshop</span>
                        </div>
                        <p class="text-light small mb-3 opacity-90">
                            Pusat perbelanjaan nutrisi anabul premium dan layanan perawatan salon grooming profesional berlisensi untuk kucing dan anjing kesayangan Anda.
                        </p>
                        <div class="d-flex gap-2 flex-wrap">
                            <span class="badge bg-yellow text-dark border border-2 border-dark px-3 py-1 fw-bold" style="box-shadow: 2px 2px 0px #000000;">Nutrisi Pilihan</span>
                            <span class="badge bg-white text-dark border border-2 border-dark px-3 py-1 fw-bold" style="box-shadow: 2px 2px 0px #000000;">Grooming Berlisensi</span>
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
                                <span class="badge bg-yellow text-dark p-1 rounded-circle border border-1 border-dark">&bull;</span>
                                <span class="fw-semibold">Ruko Pet Center No. 1, Batam</span>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-yellow text-dark p-1 rounded-circle border border-1 border-dark">&bull;</span>
                                <span class="fw-semibold">+62 812-3456-7890</span>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-yellow text-dark p-1 rounded-circle border border-1 border-dark">&bull;</span>
                                <span class="fw-semibold">Buka Setiap Hari: 08.00 - 20.00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PBL Attribution & Student Info -->
                <div class="pt-3 border-top border-1 border-secondary mb-3 d-flex flex-column flex-lg-row align-items-center justify-content-between gap-3 text-center text-lg-start">
                    <div style="font-size: 0.8rem; line-height: 1.6;" class="text-light">
                        <div class="fw-bold mb-1 d-flex align-items-center justify-content-center justify-content-lg-start gap-2 flex-wrap">
                            <span class="badge bg-yellow text-dark border border-1 border-dark px-2 py-0 fw-bold" style="font-size: 0.68rem; letter-spacing: 0.4px;">PROJECT PBL</span>
                            <span class="opacity-90">Aplikasi ini dikembangkan sebagai Proyek Project Based Learning (PBL) di <strong>Politeknik Negeri Batam</strong> oleh:</span>
                        </div>
                        <div class="text-light opacity-85">
                            <strong>3312411001</strong> &mdash; Dea Asnuari &nbsp;&bull;&nbsp; 
                            <strong>3312411004</strong> &mdash; Hamdan Azmi &nbsp;&bull;&nbsp; 
                            <strong>3312411008</strong> &mdash; Christian Marcelino Sinaga &nbsp;&bull;&nbsp; 
                            <strong>3312411031</strong> &mdash; Fatra Syahreza
                        </div>
                    </div>
                    <div class="text-nowrap">
                        <span class="badge bg-yellow text-dark border border-2 border-dark px-3 py-1 fw-bold" style="box-shadow: 2px 2px 0px #000000; font-size: 0.75rem;">Politeknik Negeri Batam</span>
                    </div>
                </div>

                <!-- Copyright -->
                <div class="pt-2 border-top border-1 border-secondary text-center text-md-start">
                    <small class="text-light opacity-75 fw-bold">
                        &copy; 2026 <strong>MiaWoof Petshop System</strong>. Seluruh Hak Cipta Dilindungi.
                    </small>
                </div>
            </div>
        </footer>
    `;
}
