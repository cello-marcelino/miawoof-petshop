const fs = require('fs');
const path = require('path');
const db = require('../../src/config/database');
const AuthService = require('../../src/services/AuthService');

const adminPassword = AuthService.hashPassword('admin123');
const customerPassword = AuthService.hashPassword('customer123');

console.log('🔄 Memulai proses seeding MiaWoof Petshop database...');

db.serialize(() => {
    // 0. Hapus dan buat ulang seluruh tabel dengan skema baru
    db.run('DROP TABLE IF EXISTS booking');
    db.run('DROP TABLE IF EXISTS pesanan');
    db.run('DROP TABLE IF EXISTS paket_grooming');
    db.run('DROP TABLE IF EXISTS produk');
    db.run('DROP TABLE IF EXISTS slides');
    db.run('DROP TABLE IF EXISTS media_assets');
    db.run('DROP TABLE IF EXISTS users');

    db.run(`
        CREATE TABLE media_assets (
            id_asset INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            file_url TEXT NOT NULL UNIQUE,
            kategori TEXT NOT NULL CHECK(kategori IN ('promosi', 'katalog')),
            file_size INTEGER DEFAULT 0,
            size_formatted TEXT,
            mime_type TEXT DEFAULT 'image/jpeg',
            is_deletable INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT,
            no_hp TEXT,
            alamat TEXT,
            role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('admin', 'customer'))
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS produk (
            id_produk INTEGER PRIMARY KEY AUTOINCREMENT,
            nama TEXT NOT NULL,
            kategori TEXT NOT NULL CHECK(kategori IN ('kucing', 'anjing')),
            stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
            harga INTEGER NOT NULL CHECK(harga >= 0),
            gambar TEXT,
            id_asset INTEGER,
            tgl_dibuat TEXT DEFAULT CURRENT_TIMESTAMP,
            tgl_expired TEXT,
            FOREIGN KEY (id_asset) REFERENCES media_assets(id_asset) ON DELETE SET NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS paket_grooming (
            id_paket INTEGER PRIMARY KEY AUTOINCREMENT,
            nama_paket TEXT NOT NULL,
            jenis_hewan TEXT NOT NULL CHECK(jenis_hewan IN ('kucing', 'anjing')),
            harga INTEGER NOT NULL CHECK(harga >= 0),
            durasi_menit INTEGER DEFAULT 60,
            keterangan_grooming TEXT NOT NULL,
            gambar TEXT,
            id_asset INTEGER,
            FOREIGN KEY (id_asset) REFERENCES media_assets(id_asset) ON DELETE SET NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS pesanan (
            id_pesanan INTEGER PRIMARY KEY AUTOINCREMENT,
            id_produk INTEGER NOT NULL,
            id_pembeli INTEGER NOT NULL,
            jumlah INTEGER NOT NULL CHECK(jumlah > 0),
            total INTEGER NOT NULL CHECK(total >= 0),
            metode_pengambilan TEXT NOT NULL DEFAULT 'ambil_ditoko',
            alamat_pengiriman TEXT,
            no_hp_penerima TEXT,
            catatan_pelanggan TEXT,
            catatan_admin TEXT,
            komplain_text TEXT,
            komplain_tanggapan TEXT,
            tgl_pesanan TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            status TEXT NOT NULL DEFAULT 'menunggu_konfirmasi',
            FOREIGN KEY (id_produk) REFERENCES produk(id_produk) ON DELETE CASCADE,
            FOREIGN KEY (id_pembeli) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS booking (
            id_booking INTEGER PRIMARY KEY AUTOINCREMENT,
            id_paket INTEGER NOT NULL,
            id_customer INTEGER NOT NULL,
            nama_hewan TEXT,
            jenis_hewan TEXT,
            tgl_booking TEXT NOT NULL,
            waktu TEXT NOT NULL,
            catatan TEXT,
            catatan_admin TEXT,
            status TEXT NOT NULL DEFAULT 'menunggu_konfirmasi',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_paket) REFERENCES paket_grooming(id_paket) ON DELETE CASCADE,
            FOREIGN KEY (id_customer) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS slides (
            id_slide INTEGER PRIMARY KEY AUTOINCREMENT,
            judul TEXT NOT NULL,
            subjudul TEXT,
            gambar TEXT NOT NULL,
            id_asset INTEGER,
            link_url TEXT DEFAULT '/produk',
            urutan INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_asset) REFERENCES media_assets(id_asset) ON DELETE SET NULL
        )
    `);

    console.log('🧹 Tabel & data lama berhasil direset.');

    // 2. Insert Media Assets (SSOT Media Library)
    const assetStmt = db.prepare(`
        INSERT INTO media_assets (id_asset, filename, file_url, kategori, file_size, size_formatted, mime_type, is_deletable)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const assetsData = [
        // Promosi Banners (Preset Protected)
        [1, 'banner1.jpg', '/images/banners/banner1.jpg', 'promosi', 2672485, '2.5 MB', 'image/jpeg', 0],
        [2, 'banner2.jpg', '/images/banners/banner2.jpg', 'promosi', 814513, '795.4 KB', 'image/jpeg', 0],
        [3, 'banner3.jpg', '/images/banners/banner3.jpg', 'promosi', 852455, '832.5 KB', 'image/jpeg', 0],
        [4, 'petAds1.jpg', '/images/banners/petAds1.jpg', 'promosi', 22938, '22.4 KB', 'image/jpeg', 0],
        [5, 'petAds2.jpg', '/images/banners/petAds2.jpg', 'promosi', 24503, '23.9 KB', 'image/jpeg', 0],
        [6, 'petAds3.jpg', '/images/banners/petAds3.jpg', 'promosi', 35169, '34.3 KB', 'image/jpeg', 0],
        [7, 'petAds4.jpg', '/images/banners/petAds4.jpg', 'promosi', 46478, '45.4 KB', 'image/jpeg', 0],
        // Katalog Produk Images
        [8, 'whiskas_tuna.webp', '/uploads/whiskas_tuna.webp', 'katalog', 90406, '88.3 KB', 'image/webp', 1],
        [9, 'royal_canin_kitten.jpg', '/uploads/royal_canin_kitten.jpg', 'katalog', 66246, '64.7 KB', 'image/jpeg', 1],
        [10, 'royal_canin_pouch.jpg', '/uploads/royal_canin_pouch.jpg', 'katalog', 118227, '115.5 KB', 'image/jpeg', 1],
        [11, 'dog_food_pedigree.jpg', '/uploads/dog_food_pedigree.jpg', 'katalog', 44883, '43.8 KB', 'image/jpeg', 1],
        [12, 'dog_food_proplan.jpg', '/uploads/dog_food_proplan.jpg', 'katalog', 44296, '43.3 KB', 'image/jpeg', 1],
        [13, 'jerhigh_treats.jpg', '/uploads/jerhigh_treats.jpg', 'katalog', 28587, '27.9 KB', 'image/jpeg', 1],
        [14, 'cat_shampoo.jpg', '/uploads/cat_shampoo.jpg', 'katalog', 6348, '6.2 KB', 'image/jpeg', 1],
        [15, 'adult_cat_food.jpg', '/uploads/adult_cat_food.jpg', 'katalog', 78755, '76.9 KB', 'image/jpeg', 1],
        [16, '1786942297148-636c1d0342a327d9.jfif', '/uploads/1786942297148-636c1d0342a327d9.jfif', 'katalog', 48784, '47.6 KB', 'image/jpeg', 1]
    ];

    assetsData.forEach(a => assetStmt.run(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]));
    assetStmt.finalize();
    console.log('✅ 16 Master Media Assets (7 Promosi, 9 Katalog) berhasil diinjeksi ke Database.');

    // 3. Insert Users (1 Admin & 5 Customers)
    const userStmt = db.prepare(`INSERT INTO users (username, password, full_name, email, no_hp, alamat, role) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    
    // Admin
    userStmt.run('admin', adminPassword, 'MiaWoof Head Admin', 'admin@miawoof.com', '081234567890', 'Ruko Pet Center No. 1, Jakarta', 'admin');

    // Customers (5 PBL Developers)
    const customers = [
        ['dea_asnuari', 'Dea Asnuari', 'dea.asnuari@miawoof.com', '081234567801', 'Batam Centre, Kota Batam'],
        ['hamdan_azmi', 'Hamdan Azmi', 'hamdan.azmi@miawoof.com', '081234567802', 'Batu Aji, Kota Batam'],
        ['christian_marcelino', 'Christian Marcelino Sinaga', 'marcelino@miawoof.com', '081234567803', 'Tiban Indah, Kota Batam'],
        ['setya_pramudiya', 'Setya Pramudiya Hakim', 'setya.pramudiya@miawoof.com', '081234567804', 'Bengkong, Kota Batam'],
        ['fatra_syahreza', 'Fatra Syahreza', 'fatra.syahreza@miawoof.com', '081234567805', 'Nongsa, Kota Batam']
    ];

    customers.forEach(c => {
        userStmt.run(c[0], customerPassword, c[1], c[2], c[3], c[4], 'customer');
    });
    userStmt.finalize();
    console.log('✅ Users berhasil dibuat (1 Admin, 5 Customer Pengembang PBL).');

    // 4. Insert Paket Grooming
    const paketStmt = db.prepare(`INSERT INTO paket_grooming (nama_paket, jenis_hewan, harga, durasi_menit, keterangan_grooming, gambar, id_asset) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    const pakets = [
        ['Paket Reguler Kucing', 'kucing', 45000, 45, 'Mandi Shampo Khusus Kucing, Pengeringan, Potong Kuku, Pembersihan Telinga', '/uploads/cat_shampoo.jpg', 14],
        ['Paket Reguler Anjing', 'anjing', 55000, 50, 'Mandi Wangi Anti Kutu, Pengeringan Bulu, Potong Kuku, Pembersihan Telinga', '/uploads/dog_food_pedigree.jpg', 11],
        ['Paket Premium Kucing', 'kucing', 65000, 60, 'Mandi Spa Anti Jamur, Pengeringan, Potong Kuku, Bersih Telinga, Rapikan Bulu Wajah & Cakar, Parfum Khusus', '/uploads/royal_canin_kitten.jpg', 9],
        ['Paket Premium Anjing', 'anjing', 75000, 75, 'Mandi Spa Medicated, Pengeringan Bulu Tebal, Potong Kuku, Bersih Telinga & Gigi, Styling Bulu, Parfum', '/uploads/dog_food_proplan.jpg', 12]
    ];
    pakets.forEach(p => paketStmt.run(p[0], p[1], p[2], p[3], p[4], p[5], p[6]));
    paketStmt.finalize();
    console.log('✅ 4 Paket Grooming Master Data berhasil diinjeksi.');

    // 5. Insert Produk dengan FK id_asset & Gambar
    const prodStmt = db.prepare(`INSERT INTO produk (nama, kategori, stock, harga, gambar, id_asset, tgl_expired) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    const produks = [
        ['Whiskas Tuna Adult 1.2kg', 'kucing', 35, 68000, '/uploads/whiskas_tuna.webp', 8, '2026-12-31'],
        ['Royal Canin Kitten Mother & Baby 2kg', 'kucing', 20, 245000, '/uploads/royal_canin_kitten.jpg', 9, '2026-10-15'],
        ['Royal Canin Adult Wet Pouch 85g', 'kucing', 50, 25000, '/uploads/royal_canin_pouch.jpg', 10, '2026-11-20'],
        ['Pedigree Beef & Vegetables 3kg', 'anjing', 18, 115000, '/uploads/dog_food_pedigree.jpg', 11, '2026-09-30'],
        ['Pro Plan Puppy Medium Chicken 2.5kg', 'anjing', 15, 290000, '/uploads/dog_food_proplan.jpg', 12, '2027-01-10'],
        ['JerHigh Bacon Dog Treats 70g', 'anjing', 40, 22000, '/uploads/jerhigh_treats.jpg', 13, '2026-08-25'],
        ['MiaWoof Organic Pet Shampoo 250ml', 'kucing', 30, 48000, '/uploads/cat_shampoo.jpg', 14, '2027-05-01'],
        ['Adult Cat Premium Food 1.5kg', 'kucing', 25, 85000, '/uploads/adult_cat_food.jpg', 15, '2027-06-15']
    ];
    produks.forEach(p => prodStmt.run(p[0], p[1], p[2], p[3], p[4], p[5], p[6]));
    prodStmt.finalize();
    console.log('✅ 8 Produk Makanan & Perlengkapan berhasil diinjeksi dengan relasi FK id_asset.');

    // 6. Insert Slides Promosi dengan FK id_asset
    const slideStmt = db.prepare(`INSERT INTO slides (judul, subjudul, gambar, id_asset, link_url, urutan, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    const defaultSlides = [
        ['Promo Nutrisi Anabul Premium', 'Diskon Spesial hingga 30% untuk varian Royal Canin & ProPlan', '/images/banners/banner1.jpg', 1, '/produk', 1, 1],
        ['Salon & Spa Higienis Berlisensi', 'Treatment anti-kutu & jamur dengan peralatan steril medis', '/images/banners/banner2.jpg', 2, '/grooming', 2, 1],
        ['Snack & Treats Berkualitas', 'Dukung daya tahan tubuh dan keindahan bulu anabul kesayangan', '/images/banners/banner3.jpg', 3, '/produk', 3, 1],
        ['Layanan Cepat Ambil di Toko / Diantar', 'Pesan praktis dari rumah, siap dikirim atau diambil langsung', '/images/banners/petAds1.jpg', 4, '/produk', 4, 1]
    ];
    defaultSlides.forEach(s => slideStmt.run(s[0], s[1], s[2], s[3], s[4], s[5], s[6]));
    slideStmt.finalize();
    console.log('✅ 4 Slide Promosi Master Data berhasil diinjeksi.');

    // 7. Insert Dummy Orders (Pesanan)
    const orderStmt = db.prepare(`INSERT INTO pesanan (id_produk, id_pembeli, jumlah, total, status) VALUES (?, ?, ?, ?, ?)`);
    orderStmt.run(1, 2, 2, 136000, 'selesai');
    orderStmt.run(4, 3, 1, 115000, 'diproses');
    orderStmt.run(3, 4, 3, 75000, 'menunggu pembayaran');
    orderStmt.run(2, 5, 1, 245000, 'selesai');
    orderStmt.run(6, 6, 2, 44000, 'menunggu pembayaran');
    orderStmt.finalize();
    console.log('✅ 5 Pesanan Belanja Dummy berhasil dibuat.');

    // 8. Insert Dummy Bookings (Reservasi Grooming)
    const bookStmt = db.prepare(`INSERT INTO booking (id_paket, id_customer, tgl_booking, waktu, status) VALUES (?, ?, ?, ?, ?)`);
    bookStmt.run(1, 2, '2026-08-16', '10:00', 'dikonfirmasi');
    bookStmt.run(3, 3, '2026-08-17', '13:30', 'menunggu konfirmasi');
    bookStmt.run(2, 4, '2026-08-18', '11:00', 'dikonfirmasi');
    bookStmt.run(4, 5, '2026-08-19', '15:00', 'menunggu konfirmasi');
    bookStmt.finalize(() => {
        console.log('✅ 4 Jadwal Reservasi Grooming Dummy berhasil dibuat.');
        console.log('🎉 Seeding MiaWoof Petshop Selesai Sepenuhnya!');
        db.close((err) => {
            if (err) console.error('Error closing db:', err.message);
            else console.log('🔒 Database connection closed.');
            process.exit(0);
        });
    });
});
