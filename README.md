# Miawoof Petshop - Mini E-commerce catalog, Booking System and media asset management

Dokumentasi studi dan panduan implementasi sistem informasi **Miawoof Petshop**, sebuah platform berbasis web yang dikembangkan sebagai proyek **Project Based Learning (PBL) Tahun 2024** di **Politeknik Negeri Batam**.

Sistem ini dirancang untuk mendigitalkan proses operasional toko hewan peliharaan secara menyeluruh, mencakup layanan belanja perlengkapan hewan (*Mini E-Commerce*), penjadwalan perawatan hewan (*Grooming Reservation*), serta pengelolaan konten spanduk dan berkas promosi toko (*Media Asset Management*).

---

## 📌 Latar Belakang & Tujuan Studi

Pada operasional toko hewan konvensional, pencatatan pesanan produk dan antrean perawatan salon hewan sering kali dilakukan secara manual, yang berisiko menimbulkan kesalahan pencatatan stok dan jadwal perawatan yang bertumpuk. 

Proyek studi ini bertujuan untuk:
1. **Memudahkan Pelanggan**: Memberikan kemudahan dalam menelusuri katalog produk, melakukan pemesanan belanja, dan memesan jadwal salon hewan secara mandiri kapan saja.
2. **Membantu Pengelola Toko**: Menyediakan panel administrasi terpadu untuk memantau pesanan masuk, mengelola ketersediaan produk, mengatur antrean salon, serta memperbarui tampilan spanduk promo di halaman utama.
3. **Menerapkan Standar Perangkat Lunak yang Baik**: Mengimplementasikan arsitektur aplikasi berlapis yang rapi, aman, dan mudah dikembangkan lebih lanjut.

---

## 🌟 Fitur Utama Sistem

### 1. Katalog Belanja & Pemesanan Produk (*Mini E-Commerce*)
- **Pencarian & Filter Kategori**: Pelanggan dapat mencari produk berdasarkan nama atau menyaring kategori khusus kebutuhan kucing maupun anjing.
- **Pilihan Metode Pengambilan Fleksibel**:
  - 🏪 **Ambil Sendiri di Toko** (Bebas biaya ongkir, barang disiapkan pengelola).
  - 🚚 **Diantar Kurir Toko** (Pengiriman langsung ke alamat rumah pelanggan).
- **Pengelolaan Stok Otomatis**: Jumlah stok berkurang secara otomatis saat pesanan dibuat dan akan dikembalikan (*restock*) secara otomatis jika pesanan dibatalkan.
- **Layanan Komplain Pesanan**: Pelanggan dapat menyampaikan kendala pesanan melalui sistem dan menerima tanggapan langsung dari pengelola toko.

### 2. Layanan Reservasi Salon & Perawatan (*Grooming Booking*)
- **Katalog Paket Perawatan**: Informasi transparan mengenai paket perawatan (mandi sehat, potong kuku, pembersihan telinga, hingga paket styling kutu dan jamur).
- **Penjadwalan Teratur**: Pelanggan memilih tanggal dan jam kedatangan yang diinginkan untuk menghindari antrean panjang di lokasi.
- **Alur Konfirmasi Bertahap**: Status reservasi dipantau secara langsung mulai dari *Menunggu Konfirmasi*, *Dikonfirmasi oleh Toko*, hingga *Selesai Perawatan*.

### 3. Pengelolaan Banner Promosi & Galeri Media (*Media Asset Management*)
- **Upload Spanduk Promosi Visual**: Pengelola dapat mengunggah gambar spanduk baru untuk ditampilkan pada korsel beranda toko secara interaktif.
- **Pustaka Galeri Media Terpusat**: Seluruh gambar produk dan banner tersimpan rapi dalam pustaka media yang dilengkapi fitur pencarian, salin tautan gambar, dan pratinjau instan.
- **Efisiensi Penyimpanan**: Dilengkapi opsi untuk menghapus gambar lama dari server atau menyimpannya kembali di galeri saat melakukan pembaruan berkas.

### 4. Pusat Aktivitas Pelanggan & Riwayat Terpadu
- **Riwayat Belanja & Booking**: Pelanggan dapat melacak status pengiriman barang dan jadwal salon melalui halaman akun pribadi.
- **Tampilan Tiket Detail**: Seluruh rincian biaya, catatan pengiriman, dan alamat disajikan dalam format tiket informasi yang bersih dan mudah dibaca.
- **Pengelolaan Riwayat**: Pelanggan dapat membersihkan data riwayat pesanan atau reservasi yang telah selesai/dibatalkan.

### 5. Keamanan & Kenyamanan Pengguna
- **Pemisahan Peran Akun**: Pembagian akses yang tegas antara pengelola toko (*Admin*) dan pembeli (*Customer*).
- **Perlindungan Data Sandi**: Kata sandi akun disimpan dalam bentuk acak yang terenkripsi aman.
- **Validasi Berkas Unggahan**: Berkas gambar diperiksa format dan ukurannya secara otomatis untuk mencegah kesalahan sistem.

---

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan teknologi web standar yang ringan, mandiri, dan mudah dipelajari:

- **Lingkungan & Server**: **Node.js** (Menjalankan server web dan layanan data secara mandiri tanpa ketergantungan framework yang rumit).
- **Basis Data**: **SQLite3** (Penyimpanan basis data lokal berbasis berkas yang praktis, cepat, dan terstruktur).
- **Antarmuka Pengguna (Frontend)**: **HTML5**, **Vanilla JavaScript**, dan **Bootstrap 5**.
- **Konsep Desain Tampilan**: Desain modern dengan gaya **Neo-Brutalist** yang mengutamakan garis batas tegas, tata letak yang lapang, serta perpaduan warna kontras (*Deep Navy, Cyber Yellow, dan Clean White*) untuk kemudahan navigasi.

---

## 📂 Struktur Penataan Berkas Proyek

```text
miawoof-petshop/
├── database/                     # Tempat penyimpanan basis data lokal
│   ├── petshop.db                # Berkas utama basis data SQLite
│   └── seeders/                  # Skrip pembuat data awal untuk uji coba sistem
│
├── src/                          # Kode sumber utama aplikasi (Backend & Tampilan)
│   ├── config/                   # Pengaturan koneksi dan struktur tabel basis data
│   ├── controllers/              # Pengatur alur permintaan data (Katalog, Booking, Pengguna, Media)
│   ├── services/                 # Logika utama (pengecekan stok, perhitungan biaya, enkripsi)
│   ├── repositories/             # Perintah pengolahan data ke SQLite (Simpan, Baca, Ubah, Hapus)
│   ├── utils/                    # Fungsi pembantu (pengatur sesi login, pengunggah berkas)
│   └── views/                    # Halaman antarmuka web (HTML)
│       ├── admin/                # Halaman kendali pengelola toko (Pesanan, Grooming, Produk, Banner)
│       ├── customer/             # Halaman utama untuk pelanggan (Beranda, Katalog, Booking, Riwayat)
│       └── auth/                 # Halaman Masuk (Login) dan Pendaftaran Akun Baru
│
├── public/                       # Aset publik yang dapat diakses langsung oleh peramban
│   ├── css/                      # Lembar gaya dan penataan warna tampilan web
│   ├── js/                       # Skrip komponen antarmuka (Menu Navigasi, Sidebar, Footer)
│   ├── uploads/                  # Folder penyimpanan berkas gambar yang diunggah pengguna
│   └── images/                   # Gambar ilustrasi, logo toko, dan spanduk bawaan
│
├── server.js                     # Berkas utama peladen (Entry Point Server Aplikasi)
└── package.json                  # Catatan konfigurasi dan pustaka pendukung aplikasi
```

---

## 💻 Panduan Menjalankan Aplikasi Secara Lokal

Untuk menguji dan menjalankan aplikasi ini pada komputer lokal, ikuti tahapan berikut:

1. **Persiapan**: Pastikan komputer telah terpasang **[Node.js](https://nodejs.org)** (versi 16 atau lebih baru).
2. **Masuk ke Direktori Proyek**: Buka aplikasi terminal/Command Prompt dan arahkan ke folder proyek:
   ```bash
   cd miawoof-petshop
   ```
3. **Instalasi Paket Pendukung**: Jalankan perintah instalasi dependensi:
   ```bash
   npm install
   ```
4. **Injeksi Data Awal (Opsional untuk Uji Coba)**: Masukkan data contoh (produk, layanan grooming, banner, dan akun simulasi):
   ```bash
   npm run seed
   ```
5. **Jalankan Peladen (Server)**:
   ```bash
   node server.js
   ```
6. **Akses Aplikasi**: Buka peramban web (*browser*) dan kunjungi tautan:
   **`http://localhost:3000`**

---

## 🔑 Informasi Akun Pengujian (*Demo Login*)

Tersedia akun simulasi yang siap digunakan untuk menguji fungsionalitas sistem:

- **Akun Pengelola (Administrator)**:
  - **Username**: `admin`
  - **Password**: `admin123`
- **Akun Pelanggan (Customer / Anggota Tim Pengembang)**:
  - `dea_asnuari` | Password: `customer123`
  - `hamdan_azmi` | Password: `customer123`
  - `christian_marcelino` | Password: `customer123`
  - `setya_pramudiya` | Password: `customer123`
  - `fatra_syahreza` | Password: `customer123`

---

## 👥 Tim Pengembang Project Based Learning (PBL)

Aplikasi ini dikembangkan sebagai karya studi terapan pada program **Project Based Learning (PBL) Tahun 2024** di **Politeknik Negeri Batam** oleh:

| No. | NIM Mahasiswa | Nama Anggota Pengembang |
|:---:|:---:|:---|
| 1 | `3312411001` | **Dea Asnuari** |
| 2 | `3312411004` | **Hamdan Azmi** |
| 3 | `3312411008` | **Christian Marcelino Sinaga** |
| 4 | `3312411030` | **Setya Pramudiya Hakim** |
| 5 | `3312411031` | **Fatra Syahreza** |
