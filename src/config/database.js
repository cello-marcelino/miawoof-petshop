const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(__dirname, '../../database');
const dbPath = path.resolve(dbDir, 'petshop.db');

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to SQLite database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database: petshop.db');
        db.run('PRAGMA foreign_keys = ON;');
        initializeTables();
    }
});

function initializeTables() {
    db.serialize(() => {
        // 1. Users Table (Admin & Customer)
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

        // 2. Produk Table
        db.run(`
            CREATE TABLE IF NOT EXISTS produk (
                id_produk INTEGER PRIMARY KEY AUTOINCREMENT,
                nama TEXT NOT NULL,
                kategori TEXT NOT NULL CHECK(kategori IN ('kucing', 'anjing')),
                stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
                harga INTEGER NOT NULL CHECK(harga >= 0),
                gambar TEXT,
                tgl_dibuat TEXT DEFAULT CURRENT_TIMESTAMP,
                tgl_expired TEXT
            )
        `);

        // 3. Paket Grooming Table
        db.run(`
            CREATE TABLE IF NOT EXISTS paket_grooming (
                id_paket INTEGER PRIMARY KEY AUTOINCREMENT,
                nama_paket TEXT NOT NULL,
                jenis_hewan TEXT NOT NULL CHECK(jenis_hewan IN ('kucing', 'anjing')),
                harga INTEGER NOT NULL CHECK(harga >= 0),
                durasi_menit INTEGER DEFAULT 60,
                keterangan_grooming TEXT NOT NULL,
                gambar TEXT
            )
        `);

        // 4. Pesanan Table (Orders with Pickup/Delivery, Workflow & Complaints)
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

        // 5. Booking Table (Grooming Schedule)
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

        // 6. Slides Table (Content Management for Homepage Promotional Banners)
        db.run(`
            CREATE TABLE IF NOT EXISTS slides (
                id_slide INTEGER PRIMARY KEY AUTOINCREMENT,
                judul TEXT NOT NULL,
                subjudul TEXT,
                gambar TEXT NOT NULL,
                link_url TEXT DEFAULT '/produk',
                urutan INTEGER DEFAULT 0,
                is_active INTEGER DEFAULT 1,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Run Safe Column Migrations for Existing Databases
        runMigrations();
    });
}

function runMigrations() {
    const alterStatements = [
        // Pesanan columns
        `ALTER TABLE pesanan ADD COLUMN metode_pengambilan TEXT NOT NULL DEFAULT 'ambil_ditoko'`,
        `ALTER TABLE pesanan ADD COLUMN alamat_pengiriman TEXT`,
        `ALTER TABLE pesanan ADD COLUMN no_hp_penerima TEXT`,
        `ALTER TABLE pesanan ADD COLUMN catatan_pelanggan TEXT`,
        `ALTER TABLE pesanan ADD COLUMN catatan_admin TEXT`,
        `ALTER TABLE pesanan ADD COLUMN komplain_text TEXT`,
        `ALTER TABLE pesanan ADD COLUMN komplain_tanggapan TEXT`,
        `ALTER TABLE pesanan ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP`,
        // Booking columns
        `ALTER TABLE booking ADD COLUMN nama_hewan TEXT`,
        `ALTER TABLE booking ADD COLUMN jenis_hewan TEXT`,
        `ALTER TABLE booking ADD COLUMN catatan TEXT`,
        `ALTER TABLE booking ADD COLUMN catatan_admin TEXT`,
        `ALTER TABLE booking ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP`,
        // Paket Grooming columns
        `ALTER TABLE paket_grooming ADD COLUMN durasi_menit INTEGER DEFAULT 60`,
        `ALTER TABLE paket_grooming ADD COLUMN gambar TEXT`
    ];

    alterStatements.forEach(sql => {
        db.run(sql, (err) => {
            // Ignore error if column already exists
        });
    });

    // Self-healing migration for slide image paths
    db.run("UPDATE slides SET gambar = '/images/banners/banner1.jpg' WHERE gambar LIKE '%slide1.png'");
    db.run("UPDATE slides SET gambar = '/images/banners/banner2.jpg' WHERE gambar LIKE '%slide2.png'");
    db.run("UPDATE slides SET gambar = '/images/banners/banner3.jpg' WHERE gambar LIKE '%slide3.png'");
    db.run("UPDATE slides SET gambar = '/images/banners/petAds1.jpg' WHERE gambar LIKE '%slide4.png'");

    // Self-healing migration for booking status normalization
    db.run("UPDATE booking SET status = 'menunggu_konfirmasi' WHERE status = 'menunggu konfirmasi'");

    // Seed default slides if table is empty
    db.get('SELECT COUNT(*) as count FROM slides', [], (err, row) => {
        if (!err && row && row.count === 0) {
            const defaultSlides = [
                ['Promo Nutrisi Anabul Premium', 'Diskon Spesial hingga 30% untuk varian Royal Canin & ProPlan', '/images/banners/banner1.jpg', '/produk', 1],
                ['Salon & Spa Higienis Berlisensi', 'Treatment anti-kutu & jamur dengan peralatan steril medis', '/images/banners/banner2.jpg', '/grooming', 2],
                ['Snack & Treats Berkualitas', 'Dukung daya tahan tubuh dan keindahan bulu anabul kesayangan', '/images/banners/banner3.jpg', '/produk', 3],
                ['Layanan Cepat Ambil di Toko / Diantar', 'Pesan praktis dari rumah, siap dikirim atau diambil langsung', '/images/banners/petAds1.jpg', '/produk', 4]
            ];

            const insertStmt = db.prepare('INSERT INTO slides (judul, subjudul, gambar, link_url, urutan, is_active) VALUES (?, ?, ?, ?, ?, 1)');
            defaultSlides.forEach(slide => insertStmt.run(slide));
            insertStmt.finalize();
            console.log('✅ Seeded default promotional slides with valid image paths.');
        }
    });
}

module.exports = db;
