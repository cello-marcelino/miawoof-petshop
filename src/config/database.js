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
                keterangan_grooming TEXT NOT NULL
            )
        `);

        // 4. Pesanan Table (Orders)
        db.run(`
            CREATE TABLE IF NOT EXISTS pesanan (
                id_pesanan INTEGER PRIMARY KEY AUTOINCREMENT,
                id_produk INTEGER NOT NULL,
                id_pembeli INTEGER NOT NULL,
                jumlah INTEGER NOT NULL CHECK(jumlah > 0),
                total INTEGER NOT NULL CHECK(total >= 0),
                tgl_pesanan TEXT DEFAULT CURRENT_TIMESTAMP,
                status TEXT NOT NULL DEFAULT 'menunggu pembayaran',
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
                tgl_booking TEXT NOT NULL,
                waktu TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'menunggu konfirmasi',
                FOREIGN KEY (id_paket) REFERENCES paket_grooming(id_paket) ON DELETE CASCADE,
                FOREIGN KEY (id_customer) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
    });
}

module.exports = db;
