# Changelog MiaWoof Petshop

Semua perubahan yang tercatat di dokumen ini diurutkan berdasarkan implementasi sejak versi *Frontend UI* pertama kali diintegrasikan.

## [Terkini] - 2026-08-17

### 🚀 Fitur Baru (New Features)
- **Manajemen Banner & Slide Promosi (Admin CMS)**: Fitur CRUD banner promosi visual dengan *live image preview*, target tautan, urutan tayang dinamis, status aktif/non-aktif, serta opsi pengelolaan berkas gambar lama vs galeri aset.
- **Pustaka Media & Galeri Asset (`/api/assets`)**: Halaman penjelajah aset media server secara visual yang dilengkapi informasi ukuran file (*KB*), direktori asal, fitur pencarian nama gambar, tombol salin URL instan, dan integrasi *Asset Picker Modal* pada formulir produk dan slide promosi.
- **Manajemen Produk Interaktif (Admin)**: Formulir penambahan dan pembaruan produk dengan dukungan *live image preview*, file upload *multipart/form-data*, pemilih media dari galeri aset, opsi penghapusan gambar lama dari server, dan badge stok dinamis (*Habis / Kritis / Aman*).
- **Master Paket Perawatan Grooming**: Modul CRUD paket grooming khusus anjing dan kucing dengan estimasi durasi waktu pengerjaan, rincian manfaat treatment, dan tarif harga yang terintegrasi langsung ke form reservasi pelanggan.
- **Alur Konfirmasi Progresif Reservasi Grooming (Admin)**: Alur status bertahap (*Step Workflow*) mulai dari `menunggu_konfirmasi` $\to$ `dikonfirmasi` $\to$ `selesai` / `dibatalkan` lengkap dengan input catatan/edukasi groomer ke pelanggan.
- **Alur Konfirmasi Progresif Pesanan Belanja (Admin)**: Alur status pemenuhan pesanan mulai dari `menunggu_konfirmasi` $\to$ `disiapkan_di_toko` / `dalam_pengantaran` $\to$ `selesai`, serta modul penanganan resolusi komplain pelanggan.
- **Modal Tiket Detail Transaksi (Customer)**: Halaman riwayat belanja (`history_pesanan.html`) dan riwayat reservasi (`history_booking.html`) dengan modal detail interaktif untuk melihat instruksi toko/groomer, pengajuan keluhan, dan konfirmasi penerimaan barang.
- **Pemberitahuan Floating Toast**: Sistem notifikasi melayang non-blocking untuk memberikan konfirmasi visual instan kepada pengguna saat operasi CRUD, checkout, atau reservasi berhasil maupun gagal.

### 🎨 Peningkatan UI/UX (Enhancements)
- **Desain Sistem Neo-Brutalism Modern**: Penerapan palet 3-warna terpadu (*Deep Midnight Navy*, *Sunny Cyber Yellow*, dan *Crisp White*), garis border tegas 2px solid hitam, sudut membulat proporsional (*rounded 4px–8px*), dan bayangan kontras (*tactile offset shadow*).
- **Search Bar Full-Height Neo-Brutalist**: Standardisasi bilah pencarian pada seluruh dashboard admin dan katalog belanja dengan tombol kuning "Cari &rarr;" berformat *full-height* yang menyatu rapat (*seamless*) tanpa celah.
- **Penyempurnaan Tombol Aksi Tabel Reservasi Admin**: Mengganti tombol aksi tabel menjadi **"Detail"** dan **"Tolak"**, serta memindahkan tombol **"Hapus"** ke dalam modal detail untuk mencegah penghapusan data secara tidak sengaja (*anti-accidental deletion*).
- **Penguncian Pembatalan pada Reservasi Terkonfirmasi**: Menghilangkan opsi "Batalkan" baik di sisi admin maupun pelanggan ketika reservasi telah berstatus `dikonfirmasi`, mengunci alur langsung menuju tahap penyelesaian treatment.
- **Pembersihan Riwayat Sisi Pelanggan**: Menyediakan opsi **"🗑️ Hapus Riwayat"** pada modal detail untuk reservasi yang berstatus `dibatalkan` atau `selesai`, serta menonaktifkan tombol batal yang redundan.
- **Standardisasi Header & Navigasi**: Navigasi sticky dengan 3-part grid alignment, penanda halaman aktif (*active pills*), identitas logo seragam (*font Irish Grover*), dan tombol pintas panel admin saat login sebagai administrator.
- **Katalog Belanja Cerdas**: Navigasi tab kategori (*Semua, Kucing, Anjing*) dengan border konsisten di setiap state hover/active, pencarian instan, dan kartu produk responsif.

### 🐛 Perbaikan Kutu (Bug Fixes)
- **Preview Gambar Produk (Admin & Client)**: Menormalisasi jalur URL gambar produk agar selalu mengembalikan rute absolut publik (`/uploads/...` atau `/images/...`), menuntaskan isu pratinjau gambar rusak atau galat 404 pada dashboard admin dan katalog.
- **Undefined Data Rendering**: Menambahkan SQL column aliasing pada `ProductRepo.js` (`nama as nama_produk`, `stock as stok`, `tgl_expired as exp`) sehingga data produk dan metrik dasbor ter-render sempurna tanpa galat teks `undefined`.
- **Formulir Slide Promosi Error**: Menambahkan input `formSlideUrutan` yang sebelumnya hilang pada modal formulir slide promosi dan memperbaiki validasi tipe data integer/boolean pada `SlideService.js`.
- **Empty Booking Table & Database Query Error**: Memperbaiki relasi LEFT JOIN dan migrasi kolom `created_at` SQLite sehingga jadwal reservasi grooming pelanggan tampil akurat pada antarmuka admin.
- **Logout 404 & Session Destruction**: Memperbaiki penanganan endpoint `POST /api/auth/logout` pada navbar dengan penghapusan sesi yang bersih dan respons JSON yang aman.

### ⚙️ Sistem & Arsitektur (Backend)
- **Pure Layered Architecture**: Pemisahan tanggung jawab kode secara tegas ke dalam layer `Controllers` (HTTP & input parsing), `Services` (logika bisnis & siklus hidup file), `Repositories` (query SQL terparameterisasi murni), dan `Utils`.
- **Komponen Modular Frontend (DRY)**: Reusable Vanilla JS components (`sidebar.js`, `navbar.js`, `footer.js`) yang diinjeksi secara terpusat ke seluruh halaman HTML tanpa duplikasi markup.
- **Proteksi Akses Role & Session Guard**: Autentikasi sesi cookie aman untuk rute dashboard `/admin/*` dan penguncian hak akses level pengguna/pelanggan.
- **ACID Database Transactions**: Pemotongan stok produk secara atomik saat pemesanan barang dan pemulihan stok otomatis saat pesanan dibatalkan.
- **Pembersihan Dead Code & Refactoring**: Pembersihan fungsi tidak terpakai, optimasi parser body request (JSON & multipart), dan konsistensi penamaan variabel standar industri.

---
*Catatan Historis: Laporan ini direkap mulai dari titik komit "feat(frontend): refactor and modernize entire design system and components" saat UI pertama kali diintegrasikan.*
