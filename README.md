# MiaWoof Petshop CMS, Booking & Media Asset Management System (Refactored Version)

Selamat datang di repositori **MiaWoof Petshop CMS, Booking & Media Asset Management System**! Proyek ini merupakan hasil *refactoring* menyeluruh dari arsitektur warisan PHP Native menjadi sistem modern berbasis **Node.js Native** dengan **Layered Architecture Murni**, **Bootstrap 5**, dan **Vanilla Web Components** dengan estetika modern *Neo-Brutalist*.

---

## 🚀 Keunggulan & Fitur Utama

1. **Keamanan Ekstra (Zero Vulnerabilities)**:
   - Kebal serangan *SQL Injection* berkat *Parameterized Queries* di seluruh layer *Repository*.
   - Kata sandi dienkripsi menggunakan *Bcrypt Hashing* dengan 10 putaran salt.
   - Hak akses role `admin` dikunci secara server-side (mencegah celah *Privilege Escalation* pada form register).
   - Pengelolaan upload gambar dengan validasi *MIME type whitelist*, penamaan acak aman, dan proteksi *Directory Traversal*.
   - Proteksi sesi ketat berbasis *HTTP-only Cookie* dan *Route Guard Middleware*.

2. **Katalog Belanja & Checkout Atomik (E-Commerce Mini)**:
   - Pencarian produk instan dan filter kategori cepat (Khusus Kucing / Khusus Anjing).
   - Opsi metode pemenuhan pesanan: **🏪 Ambil Sendiri di Toko** atau **🚚 Diantar Kurir ke Alamat**.
   - Mekanisme pemotongan stok atomik (*ACID Transaction*) dan *automatic inventory rollback* saat pesanan dibatalkan.
   - Sistem komplain pesanan terintegrasi dengan balasan solusi resmi dari admin.

3. **Reservasi Salon & Perawatan (Grooming System)**:
   - Pilihan paket perawatan Reguler & Premium dengan rincian *treatment* lengkap.
   - Pemilihan slot tanggal & jam kedatangan dengan batas antrean teratur.
   - Alur konfirmasi progresif bertahap (*Menunggu Konfirmasi $\to$ Dikonfirmasi $\to$ Selesai Perawatan*).

4. **Kelola Banner Promosi & Galeri Asset Media (Media Library)**:
   - **Upload Banner Visual murni**: Pratinjau gambar banner langsung sebelum disimpan.
   - **Opsi Pergantian Gambar**: Pilihan untuk menghapus gambar lama dari server (*hemat penyimpanan*) atau menyimpannya di Galeri Asset.
   - **Galeri Asset & Pustaka Media (`/api/assets`)**: Visual grid seluruh aset `/uploads/` dan `/images/banners/`, info ukuran file, pencarian aset, salin URL instan, dan *Asset Picker* terintegrasi.

5. **Antarmuka Bersih & Alur Bertahap (*Clean Tables & Progressive Step Actions*)**:
   - **Desain Tabel Ramping (Prinsip DRY)**: Baris tabel pelanggan ringkas dengan tombol tunggal `🔍 Detail`, memindahkan catatan panjang dan tombol aksi ke dalam Modal Tiket Detail.
   - **Progressive Action Confirmation**: Tombol tindakan admin dan pelanggan berubah secara dinamis mengikuti status terkini (menghindari duplikasi tombol aksi).

---

## 🛠️ Stack Teknologi & Alat (*Tech Stack*)

- **Backend / Server**: Node.js Native (*Modul standar `http`, `fs`, `path`, `crypto`*)
- **Database**: SQLite3 (*File `database/petshop.db`*)
- **Kriptografi & Sesi**: Bcrypt & Cookie-based Authentication
- **Penangan Upload**: Formidable (Multi-part parser)
- **Frontend**: HTML5, Vanilla JavaScript, Vanilla CSS Variables + Bootstrap 5
- **Desain & Tema**: Neo-Brutalist dengan Palet Master 3-Warna (*Deep Navy, Cyber Yellow, Clean White*)
- **Tipografi**: Google Fonts (*Irish Grover* & *Inria Sans*)

---

## 📂 Struktur Arsitektur (Layered Standard)

```text
miawoof-petshop/
├── .agents/
│   ├── PRD.md                    # Master Blueprint & Product Requirements Document
│   └── RULES.md                  # Strict Security, Clean Code & Architectural Rules
│
├── database/
│   ├── petshop.db                # File database SQLite (terproteksi di .gitignore)
│   └── seeders/
│       └── dummy_seeder.js       # Script seeder admin, customer, produk, paket & slides
│
├── src/
│   ├── config/database.js        # Konfigurasi koneksi SQLite & migrasi otomatis tabel
│   ├── controllers/              # HTTP request/response handler (Auth, Product, Order, Booking, Slide, Asset, User)
│   ├── services/                 # Logika bisnis murni (validasi stok, kalkulasi total, enkripsi, asset handling)
│   ├── repositories/             # Query database terisolasi (CRUD SQLite terenkapsulasi)
│   ├── utils/                    # Session manager, file uploader, formatters
│   └── views/                    # Tampilan antarmuka HTML
│       ├── admin/                # Panel Admin (Dashboard, Pesanan, Grooming, Produk, Sliders, Users, Profil)
│       ├── customer/             # Portal Pelanggan (Home, Katalog, Grooming, Riwayat Pesanan, Riwayat Booking, Profil)
│       └── auth/                 # Halaman Login & Registrasi
│
├── public/
│   ├── css/                      # Token tema (variables.css), custom style (style.css), components (components.css)
│   ├── js/                       # Vanilla Web Components (navbar.js, sidebar.js, footer.js, formatters.js)
│   ├── uploads/                  # Repositori media foto produk, banner, dan berkas yang diunggah
│   └── images/                   # Aset gambar statis, branding, logo, dan preset banner
│
├── server.js                     # Native HTTP router, REST API dispatcher & static file server
└── package.json                  # Konfigurasi Node & dependencies
```

---

## 💻 Cara Menjalankan Secara Lokal (*Local Setup*)

Ikuti langkah-langkah di bawah ini untuk menjalankan server secara lokal:

1. Pastikan Anda telah memasang **[Node.js](https://nodejs.org)** (v16 atau lebih baru).
2. Buka terminal dan masuk ke direktori proyek:
   ```bash
   cd miawoof-petshop
   ```
3. Unduh seluruh dependensi aplikasi:
   ```bash
   npm install
   ```
4. Jalankan injeksi data simulasi awal (*Seeding Database*):
   ```bash
   npm run seed
   ```
5. Hidupkan server aplikasi:
   ```bash
   node server.js
   ```
6. Buka browser dan akses alamat:
   **`http://localhost:3000`**

---

### 🔑 Informasi Akun Pengujian (*Demo Login*)

Sistem telah dilengkapi data simulasi siap uji:
- **Akun Administrator**:
  - Username: `admin` | Password: `admin123`
- **Akun Customer (Pelanggan)**:
  - Username: `budi_santoso` | Password: `customer123`
  - *(Tersedia juga akun: `siti_aminah`, `dewi_lestari`, `rizky_aditya`, `putri_anindya` dengan password `customer123`)*

