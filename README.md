# MiaWoof Petshop CMS & Booking System (Refactored Version)

Selamat datang di repositori **MiaWoof Petshop CMS & Booking System**! Proyek ini merupakan hasil *refactoring* menyeluruh dari arsitektur warisan PHP Native menjadi sistem modern berbasis **Node.js Native** dengan **Layered Architecture Murni**, **Bootstrap 5**, dan **Vanilla Web Components**.

---

## 🚀 Keunggulan & Fitur Utama

1. **Keamanan Ekstra (Zero Vulnerabilities)**:
   - Kebal serangan *SQL Injection* berkat *Parameterized Queries* di seluruh layer *Repository*.
   - Kata sandi dienkripsi menggunakan *Bcrypt Hashing* dengan 10 putaran salt.
   - Hak akses role `admin` dikunci secara server-side (mencegah celah *Privilege Escalation* pada form register).
   - Pengelolaan upload gambar dengan validasi *MIME type whitelist* dan penamaan acak aman.
   - Proteksi sesi ketat berbasis *HTTP-only Cookie* dan *Route Guard Middleware*.

2. **Katalog Belanja & Checkout Atomik (E-Commerce Mini)**:
   - Pencarian produk cepat dan filter kategori instan (Khusus Kucing / Khusus Anjing).
   - Transaksi pemesanan dengan mekanisme pemotongan stok atomik (*ACID*) dan *automatic rollback* jika pesanan dibatalkan.

3. **Reservasi Salon & Perawatan (Grooming System)**:
   - Pilihan paket perawatan Reguler & Premium dengan rincian *treatment*.
   - Pemilihan slot tanggal & jam kedatangan dengan status konfirmasi realtime.

4. **Panel Admin Komprehensif**:
   - Dasbor analitik pendapatan, total pesanan, jadwal grooming, dan pengguna.
   - CRUD Produk & Inventori Stok, Manajemen Pesanan Belanja, Konfirmasi Jadwal Grooming, dan Manajemen Data Pelanggan.

---

## 🛠️ Stack Teknologi & Alat (*Tech Stack*)

- **Backend / Server**: Node.js Native (*Module `http` & `fs`*)
- **Database**: SQLite3 (*File `database/petshop.db`*)
- **Kriptografi & Sesi**: Bcrypt & Cookie
- **Penangan Upload**: Formidable
- **Frontend**: HTML5, Vanilla JavaScript, Vanilla CSS Variables + Bootstrap 5
- **Tipografi**: Google Fonts (*Irish Grover* & *Inria Sans*)

---

## 📂 Struktur Arsitektur (Layered Standard)

```text
miawoof-petshop/
├── database/
│   ├── petshop.db                # File database SQLite (terproteksi di .gitignore)
│   └── seeders/
│       └── dummy_seeder.js       # Script seeder admin, customer, produk & paket
│
├── src/
│   ├── config/database.js        # Konfigurasi koneksi SQLite & migrasi tabel
│   ├── controllers/              # HTTP request/response handler
│   ├── services/                 # Logika bisnis (validasi stok, kalkulasi total, enkripsi)
│   ├── repositories/             # Query database terisolasi (CRUD SQLite)
│   ├── utils/                    # Session manager, file uploader, input sanitizer
│   └── views/                    # Tampilan antarmuka HTML (Auth, Customer, Admin)
│
├── public/
│   ├── css/                      # Token tema, custom layout, dan Bootstrap 5
│   ├── js/                       # Komponen navbar, sidebar, footer & helper global
│   └── uploads/                  # Media foto produk & berkas transaksi
│
├── server.js                     # Native server, router & middleware guard
└── package.json
```

---

## 💻 Cara Menjalankan Secara Lokal (*Local Setup*)

Ikuti langkah-langkah mudah di bawah ini untuk menjalankan server di komputer Anda:

1. Pastikan Anda telah memasang **[Node.js](https://nodejs.org)**.
2. Buka terminal (CMD / PowerShell / Git Bash) dan masuk ke direktori proyek ini:
   ```bash
   cd miawoof-petshop
   ```
3. Unduh seluruh dependensi aplikasi:
   ```bash
   npm install
   ```
4. Jalankan injeksi data simulasi awal (*Seeding*):
   ```bash
   npm run seed
   ```
5. Hidupkan server aplikasi:
   ```bash
   node server.js
   ```
   *(Atau gunakan `npm run dev`)*.
6. Buka browser dan akses alamat berikut:
   `http://localhost:3000`

---

### 🔑 Informasi Akun Pengujian (*Demo Login*)

Sistem telah diisi dengan data simulasi yang siap dicoba:
- **Akun Administrator**:
  - Username: `admin` | Password: `admin123`
- **Akun Customer (Pelanggan)**:
  - Username: `budi_santoso` | Password: `customer123`
  - *(Tersedia juga akun: `siti_aminah`, `dewi_lestari`, `rizky_aditya`, `putri_anindya` dengan password yang sama)*
