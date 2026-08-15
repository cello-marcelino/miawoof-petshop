# Changelog & Rekam Jejak Transformasi Arsitektur

Semua catatan perubahan, pembaruan, refaktorisasi arsitektur, dan perbaikan keamanan dari versi aplikasi warisan (*Legacy PHP Native*) ke sistem modern **MiaWoof Petshop CMS** didokumentasikan dalam berkas ini.

Format pencatatan mengacu pada standar [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan prinsip [Semantic Versioning](https://semver.org/).

---

## 📑 Ringkasan Perbandingan Arsitektur

| Aspek Arsitektur | Versi Legacy (*PHP Native*) | Versi Refactored (*Node.js Native*) |
|---|---|---|
| **Pola Arsitektur** | Pseudo-MVC / Spaghetti Code (*God Files ~400 baris*) | **Layered Architecture Murni** (*Controllers, Services, Repositories, Utils, Views*) |
| **Keamanan Database** | Interpolasi string rentan *SQL Injection* | **100% Parameterized Queries** di seluruh layer Repository |
| **Penyimpanan Password** | Plain text / Hashing lemah | **Bcrypt Hashing** (10 putaran salt) |
| **Otorisasi & Hak Akses** | Celah *Privilege Escalation* pada register publik | **Role customer dikunci server-side**, Strict Session Guard |
| **Penanganan Upload** | *Double move_uploaded_file* & tanpa sanitasi | **Whitelist MIME validation**, UUID/Timestamp hashing, Anti-Traversal |
| **Manajemen Transaksi** | Tidak ada transaksi (*potensi inkonsistensi stok*) | **ACID Database Transactions** (*Atomic stock deduction & rollback*) |
| **Frontend & UI** | Copy-paste layout di setiap file HTML/PHP | **Vanilla Web Components Injection (DRY)** & **Desain Neo-Brutalist** |
| **Standar Penamaan** | Typo sistematis (*costumer, katergori, berasil*) | **Clean English/Indonesian Convention** (*customer, kategori, berhasil*) |

---

## [2.0.0] - 2026-08-15 (Major Modernization Release)

### 🛡️ Keamanan & Penambalan Celah Kritis (*Security Fixes*)
- **Fixed (Critical) SQL Injection**: Mengganti semua query interpolasi string dengan *parameterized queries* (`?`) terisolasi di layer SQLite Repository.
- **Fixed (Critical) Privilege Escalation**: Menghapus opsi pemilihan role pada formulir registrasi publik dan mengunci role `customer` secara *hardcoded* di sisi server.
- **Fixed (High) Insecure File Upload**: Menerapkan validasi ketat *MIME type whitelist* (`image/jpeg`, `image/png`, `image/webp`), batas ukuran berkas 2MB, dan penamaan berkas acak kriptografis.
- **Fixed (High) Directory Traversal**: Mengamankan endpoint manajemen dan penghapusan aset (`/api/assets/*`) dengan fungsi sanitasi `path.basename()`.
- **Fixed (Medium) Password Exposure**: Mengintegrasikan library `bcrypt` untuk enkripsi satu arah kata sandi pengguna saat registrasi dan verifikasi saat login.
- **Fixed (Medium) Session Bypassing**: Memasang *Route Guard Middleware* dan *HTTP-only Cookie Session* untuk membatasi akses area `/admin/*` hanya untuk akun terverifikasi ber-role `admin`.

---

### 🏗️ Refaktorisasi Arsitektur & Clean Code (*Architecture Refactor*)
- **Pemisahan Tanggung Jawab (*Separation of Concerns*)**:
  - **`src/controllers/`**: Menangani permintaan dan respons HTTP, validasi masukan, dan kode status REST.
  - **`src/services/`**: Menampung logika bisnis murni (*Business Logic*), kalkulasi harga, validasi ketersediaan stok, dan manajemen berkas.
  - **`src/repositories/`**: Satu-satunya layer yang berhak mengeksekusi query database ke SQLite.
  - **`src/utils/`**: Helper pendukung seperti `SessionManager`, `UploadHandler`, dan `formatters`.
  - **`src/views/`**: Antarmuka murni bebas logika database.
- **Pemberantasan Duplikasi Kode (*DRY Component Standard*)**:
  - Mengisolasi komponen berulang ke dalam modul JavaScript: `sidebar.js`, `navbar.js`, dan `footer.js`.
  - Komponen disuntikkan secara dinamis ke elemen root (`#sidebar-root`, `#navbar-root`, `#footer-root`).
- **ACID Database Transactions**:
  - Pemesanan produk menjalankan pemotongan stok dan pembuatan invoice secara atomik.
  - Pembatalan pesanan (*Cancel Order*) secara otomatis mengembalikan stok barang ke inventori.

---

### ✨ Fitur Baru & Peningkatan Alur Bisnis (*New Features*)

#### 1. 🛍️ Sistem Pesanan Belanja & Pemenuhan Fleksibel
- **Metode Pengambilan**: Pelanggan dapat memilih opsi **`🏪 Ambil Sendiri di Toko`** atau **`🚚 Diantar Kurir ke Alamat`**.
- **Data Penerima Lengkap**: Input nama penerima, nomor WhatsApp/telepon aktif, alamat pengiriman, dan catatan pesanan khusus.
- **Pusat Komplain & Solusi**: Pelanggan dapat mengajukan komplain resmi jika pesanan mengalami kendala, dan admin dapat memberikan tanggapan/solusi resmi langsung pada sistem.

#### 2. ✂️ Reservasi Layanan Salon & Grooming
- **Paket Perawatan Komprehensif**: Master data paket Reguler dan Premium untuk anjing dan kucing beserta rincian perlakuan medis/higienis.
- **Batas Slot & Antrean**: Pelanggan dapat memilih tanggal dan waktu reservasi secara terstruktur.
- **Catatan Edukasi & Kondisi Anabul**: Admin dapat menambahkan catatan hasil perawatan (*e.g. kondisi telinga, bulu, jamur*) untuk dilihat pelanggan.

#### 3. 🔄 Alur Konfirmasi Status Bertahap (*Progressive Step Workflow*)
- **Reservasi Grooming (Admin Pop-up)**:
  - Saat `menunggu_konfirmasi`: Opsi **`📅 Konfirmasi Jadwal Sesi`** dan **`❌ Batalkan`**.
  - Saat `dikonfirmasi`: Opsi **`✅ Selesai Treatment & Perawatan`** dan **`❌ Batalkan`**.
  - Saat `selesai`/`dibatalkan`: Menampilkan info tuntas tanpa tombol aksi redundant.
- **Pesanan Belanja (Admin Pop-up)**:
  - Saat `menunggu_konfirmasi`: Opsi **`🏪 Siapkan & Keep di Toko`** / **`🚚 Konfirmasi & Kirim Kurir`** dan **`❌ Batalkan`**.
  - Saat `disiapkan_di_toko`/`dalam_pengantaran`: Opsi **`✅ Tandai Selesai / Diterima`** dan **`❌ Batalkan`**.
  - Saat `komplain`: Menampilkan form respon solusi admin untuk menuntaskan komplain.

#### 4. 🖼️ Manajemen Banner Promosi & Galeri Asset Media (`/api/assets`)
- **Upload File Visual Murni**: Form slide promosi berfokus penuh pada estetika visual banner tanpa ketergantungan teks judul/deskripsi.
- **Pratinjau Langsung (*Live Image Preview*)**: Banner langsung ditampilkan di modal sebelum disimpan.
- **Opsi Hapus/Simpan Gambar Lama**: Admin dapat memilih menghapus file lama dari server (*hemat penyimpanan disk*) atau menyimpannya di Galeri Asset saat mengedit banner.
- **Pustaka Media & Galeri Asset**:
  - Grid visual seluruh gambar di `/uploads/` dan `/images/banners/`.
  - Informasi ukuran file (*e.g. 245 KB*), direktori asal, fitur pencarian nama file, dan salin URL instan.
  - **Asset Picker Modal**: Memungkinkan pemilihan banner dari galeri yang sudah ada tanpa perlu upload ulang.

#### 5. 🪟 Desain Tabel Ramping & Modal Tiket Detail Transaksi (*Clean Table Pattern*)
- **Riwayat Pelanggan Ramping ([`history_booking.html`](file:///C:/Users/USER/marcell-porto-project/miawoof-petshop/src/views/customer/history_booking.html) & [`history_pesanan.html`](file:///C:/Users/USER/marcell-porto-project/miawoof-petshop/src/views/customer/history_pesanan.html))**:
  - Kolom catatan panjang dan tombol bertumpuk dihapus dari baris tabel.
  - Baris tabel hanya menampilkan informasi utama dengan **1 tombol bersih: `🔍 Detail`**.
  - Seluruh interaksi mendalam (konfirmasi penerimaan, pembatalan, pengajuan keluhan, catatan toko) dipusatkan secara elegan di dalam **Modal Tiket Detail**.

---

### 🎨 Desain Sistem & Standarisasi UI/UX (*Design System*)
- **Estetika Neo-Brutalist Modern**:
  - Palet 3-warna master: **Deep Midnight Navy** (`#0A192F`), **Cyber Yellow** (`#FFD600`), dan **Pure White** (`#FFFFFF`).
  - Border tegas 2px solid hitam, sudut *rounded* proporsional (4px - 8px), dan bayangan kontras (*tactile offset shadow*).
- **Standarisasi Tombol Aksi**:
  - Tombol Tabel: `.btn-table-action` (`.btn-action-yellow`, `.btn-action-blue`, `.btn-action-white`, `.btn-action-danger`).
  - Tombol Modal: `.btn-action-modal` (`.btn-modal-confirm`, `.btn-modal-primary`, `.btn-modal-success`, `.btn-modal-cancel`).
- **Anti-Redundansi Modal**: Menghapus tombol "Tutup" tambahan di bagian bawah footer modal jika header sudah dilengkapi tombol silang `✕` (*btn-close*).
- **Tipografi Harmonis**: Google Fonts `"Irish Grover"` (Brand Headings) dan `"Inria Sans"` (Data Legibility).

---

### 🔤 Perbaikan Ejaan & Konvensi Penamaan (*Typo Fixes*)
- `costumer` $\to$ `customer` (*seluruh layer route, variabel, DTO, dan tabel*).
- `katergori` $\to$ `kategori`.
- `berasil` $\to$ `berhasil`.
- `tb_costumer` / `tb_barang` / `tb_beli` $\to$ skema baku `users`, `produk`, `pesanan`, `booking`, `paket_grooming`, `slides`.

---

## [1.0.0] - Versi Legacy (PHP Native Spaghetti)
- Kode awal warisan PHP native dengan query langsung di dalam berkas tampilan HTML.
- Format tabel database lama dengan celah keamanan SQL injection dan otorisasi tidak terlindungi.
