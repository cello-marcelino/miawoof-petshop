const db = require('../../src/config/database');
const bcrypt = require('bcrypt');

const adminPassword = bcrypt.hashSync('admin123', 10);
const customerPassword = bcrypt.hashSync('customer123', 10);

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

    // Customers
    const customers = [
        ['budi_santoso', 'Budi Santoso', 'budi@gmail.com', '089612345678', 'Jl. Merdeka No. 12, Jakarta'],
        ['siti_aminah', 'Siti Aminah', 'siti@gmail.com', '089623456789', 'Jl. Mawar No. 4, Depok'],
        ['dewi_lestari', 'Dewi Lestari', 'dewi@gmail.com', '089634567890', 'Perumahan Indah Blok B3, Tangerang'],
        ['rizky_aditya', 'Rizky Aditya', 'rizky@gmail.com', '089645678901', 'Jl. Sukajadi No. 88, Bandung'],
        ['putri_anindya', 'Putri Anindya', 'putri@gmail.com', '089656789012', 'Jl. Diponegoro No. 45, Bogor']
    ];

    customers.forEach(c => {
        userStmt.run(c[0], customerPassword, c[1], c[2], c[3], c[4], 'customer');
    });
    userStmt.finalize();
    console.log('✅ Users berhasil dibuat (1 Admin, 5 Customers).');

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

    // 4. Insert Produk
    const prodStmt = db.prepare(`INSERT INTO produk (nama, kategori, stock, harga, gambar, tgl_expired) VALUES (?, ?, ?, ?, ?, ?)`);
    const produks = [
        ['Whiskas Tuna Adult 1.2kg', 'kucing', 35, 68000, 'whiskas_tuna.jpg', '2026-12-31'],
        ['Royal Canin Kitten 2kg', 'kucing', 20, 245000, 'royal_canin_kitten.jpg', '2026-10-15'],
        ['Me-O Creamy Treats Salmon (4x15g)', 'kucing', 50, 25000, 'meo_treats.jpg', '2026-11-20'],
        ['Pedigree Beef & Veg 3kg', 'anjing', 18, 115000, 'pedigree_beef.jpg', '2026-09-30'],
        ['Pro Plan Puppy Medium Chicken 2.5kg', 'anjing', 15, 290000, 'proplan_puppy.jpg', '2027-01-10'],
        ['JerHigh Bacon Dog Treats 70g', 'anjing', 40, 22000, 'jerhigh_bacon.jpg', '2026-08-25'],
        ['MiaWoof Organic Cat Shampoo 250ml', 'kucing', 30, 48000, 'cat_shampoo.jpg', '2027-05-01'],
        ['MiaWoof Odorless Pet Wipes 80pcs', 'anjing', 60, 18000, 'pet_wipes.jpg', '2027-06-15']
    ];
    produks.forEach(p => prodStmt.run(p[0], p[1], p[2], p[3], p[4], p[5]));
    prodStmt.finalize();
    console.log('✅ 8 Produk Makanan & Perlengkapan berhasil diinjeksi.');

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

    console.log('🎉 Seeding MiaWoof Petshop Berhasil Sepenuhnya!');
    setTimeout(() => process.exit(0), 400);
});
