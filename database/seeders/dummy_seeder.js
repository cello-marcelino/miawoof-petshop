const db = require('../../src/config/database');
const AuthService = require('../../src/services/AuthService');

const adminPassword = AuthService.hashPassword('admin123');
const customerPassword = AuthService.hashPassword('customer123');

console.log('🔄 Memulai proses seeding MiaWoof Petshop database...');

db.serialize(() => {
    // 1. Bersihkan tabel lama
    db.run('DELETE FROM booking');
    db.run('DELETE FROM pesanan');
    db.run('DELETE FROM paket_grooming');
    db.run('DELETE FROM produk');
    db.run('DELETE FROM users');

    // Reset sequence
    db.run("DELETE FROM sqlite_sequence WHERE name IN ('users', 'produk', 'paket_grooming', 'pesanan', 'booking')");

    console.log('🧹 Data lama berhasil dikosongkan.');

    // 2. Insert Users (1 Admin & 5 Customers)
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

    // 3. Insert Paket Grooming
    const paketStmt = db.prepare(`INSERT INTO paket_grooming (nama_paket, jenis_hewan, harga, keterangan_grooming) VALUES (?, ?, ?, ?)`);
    const pakets = [
        ['Paket Reguler Kucing', 'kucing', 45000, 'Mandi Shampo Khusus Kucing, Pengeringan, Potong Kuku, Pembersihan Telinga'],
        ['Paket Reguler Anjing', 'anjing', 55000, 'Mandi Wangi Anti Kutu, Pengeringan Bulu, Potong Kuku, Pembersihan Telinga'],
        ['Paket Premium Kucing', 'kucing', 65000, 'Mandi Spa Anti Jamur, Pengeringan, Potong Kuku, Bersih Telinga, Rapikan Bulu Wajah & Cakar, Parfum Khusus'],
        ['Paket Premium Anjing', 'anjing', 75000, 'Mandi Spa Medicated, Pengeringan Bulu Tebal, Potong Kuku, Bersih Telinga & Gigi, Styling Bulu, Parfum']
    ];
    pakets.forEach(p => paketStmt.run(p[0], p[1], p[2], p[3]));
    paketStmt.finalize();
    console.log('✅ 4 Paket Grooming Master Data berhasil diinjeksi.');

    // 4. Insert Produk dengan Gambar Asli dari Legacy
    const prodStmt = db.prepare(`INSERT INTO produk (nama, kategori, stock, harga, gambar, tgl_expired) VALUES (?, ?, ?, ?, ?, ?)`);
    const produks = [
        ['Whiskas Tuna Adult 1.2kg', 'kucing', 35, 68000, 'whiskas_tuna.webp', '2026-12-31'],
        ['Royal Canin Kitten Mother & Baby 2kg', 'kucing', 20, 245000, 'royal_canin_kitten.jpg', '2026-10-15'],
        ['Royal Canin Adult Wet Pouch 85g', 'kucing', 50, 25000, 'royal_canin_pouch.jpg', '2026-11-20'],
        ['Pedigree Beef & Vegetables 3kg', 'anjing', 18, 115000, 'dog_food_pedigree.jpg', '2026-09-30'],
        ['Pro Plan Puppy Medium Chicken 2.5kg', 'anjing', 15, 290000, 'dog_food_proplan.jpg', '2027-01-10'],
        ['JerHigh Bacon Dog Treats 70g', 'anjing', 40, 22000, 'jerhigh_treats.jpg', '2026-08-25'],
        ['MiaWoof Organic Pet Shampoo 250ml', 'kucing', 30, 48000, 'cat_shampoo.jpg', '2027-05-01'],
        ['Adult Cat Premium Food 1.5kg', 'kucing', 25, 85000, 'adult_cat_food.jpg', '2027-06-15']
    ];
    produks.forEach(p => prodStmt.run(p[0], p[1], p[2], p[3], p[4], p[5]));
    prodStmt.finalize();
    console.log('✅ 8 Produk Makanan & Perlengkapan berhasil diinjeksi dengan gambar terhubung.');

    // 5. Insert Dummy Orders (Pesanan)
    const orderStmt = db.prepare(`INSERT INTO pesanan (id_produk, id_pembeli, jumlah, total, status) VALUES (?, ?, ?, ?, ?)`);
    orderStmt.run(1, 2, 2, 136000, 'selesai');
    orderStmt.run(4, 3, 1, 115000, 'diproses');
    orderStmt.run(3, 4, 3, 75000, 'menunggu pembayaran');
    orderStmt.run(2, 5, 1, 245000, 'selesai');
    orderStmt.run(6, 6, 2, 44000, 'menunggu pembayaran');
    orderStmt.finalize();
    console.log('✅ 5 Pesanan Belanja Dummy berhasil dibuat.');

    // 6. Insert Dummy Bookings (Reservasi Grooming)
    const bookStmt = db.prepare(`INSERT INTO booking (id_paket, id_customer, tgl_booking, waktu, status) VALUES (?, ?, ?, ?, ?)`);
    bookStmt.run(1, 2, '2026-08-16', '10:00', 'dikonfirmasi');
    bookStmt.run(3, 3, '2026-08-17', '13:30', 'menunggu konfirmasi');
    bookStmt.run(2, 4, '2026-08-18', '11:00', 'dikonfirmasi');
    bookStmt.run(4, 5, '2026-08-19', '15:00', 'menunggu konfirmasi');
    bookStmt.finalize();
    console.log('✅ 4 Jadwal Reservasi Grooming Dummy berhasil dibuat.');

    console.log('🎉 Seeding MiaWoof Petshop Selesai Sepenuhnya!');
    setTimeout(() => process.exit(0), 400);
});
