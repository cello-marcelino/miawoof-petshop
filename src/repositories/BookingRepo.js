const db = require('../config/database');

class BookingRepo {
    // ================= Paket Grooming CRUD =================
    static async getAllPaket() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM paket_grooming ORDER BY id_paket ASC', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async findPaketById(id_paket) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM paket_grooming WHERE id_paket = ?', [id_paket], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async createPaket({ nama_paket, jenis_hewan, harga, keterangan_grooming }) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO paket_grooming (nama_paket, jenis_hewan, harga, keterangan_grooming) VALUES (?, ?, ?, ?)';
            db.run(sql, [nama_paket, jenis_hewan, harga, keterangan_grooming], function (err) {
                if (err) reject(err);
                else resolve({ id_paket: this.lastID, nama_paket, harga });
            });
        });
    }

    static async updatePaket(id_paket, { nama_paket, jenis_hewan, harga, keterangan_grooming }) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE paket_grooming SET nama_paket = ?, jenis_hewan = ?, harga = ?, keterangan_grooming = ? WHERE id_paket = ?';
            db.run(sql, [nama_paket, jenis_hewan, harga, keterangan_grooming, id_paket], function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    static async deletePaket(id_paket) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM paket_grooming WHERE id_paket = ?', [id_paket], function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    // ================= Customer Bookings =================
    static async getAllBookings() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT b.id_booking, b.tgl_booking, b.waktu, b.status,
                       p.nama_paket, p.jenis_hewan, p.harga, p.keterangan_grooming,
                       u.full_name as customer_name, u.no_hp, u.email
                FROM booking b
                JOIN paket_grooming p ON b.id_paket = p.id_paket
                JOIN users u ON b.id_customer = u.id
                ORDER BY b.id_booking DESC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async getBookingsByCustomer(id_customer) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT b.id_booking, b.tgl_booking, b.waktu, b.status,
                       p.nama_paket, p.jenis_hewan, p.harga, p.keterangan_grooming
                FROM booking b
                JOIN paket_grooming p ON b.id_paket = p.id_paket
                WHERE b.id_customer = ?
                ORDER BY b.id_booking DESC
            `;
            db.all(sql, [id_customer], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async createBooking({ id_paket, id_customer, tgl_booking, waktu }) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO booking (id_paket, id_customer, tgl_booking, waktu, status) VALUES (?, ?, ?, ?, "menunggu konfirmasi")';
            db.run(sql, [id_paket, id_customer, tgl_booking, waktu], function (err) {
                if (err) reject(err);
                else resolve({ id_booking: this.lastID });
            });
        });
    }

    static async updateBookingStatus(id_booking, status) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE booking SET status = ? WHERE id_booking = ?', [status, id_booking], function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    static async cancelBookingByCustomer(id_booking, id_customer) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE booking SET status = "dibatalkan" WHERE id_booking = ? AND id_customer = ?', [id_booking, id_customer], function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    static async countBookings() {
        return new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(*) as total_booking,
                    SUM(CASE WHEN status = 'menunggu konfirmasi' THEN 1 ELSE 0 END) as pending_booking,
                    SUM(CASE WHEN status = 'dikonfirmasi' THEN 1 ELSE 0 END) as confirmed_booking
                FROM booking
            `, [], (err, row) => {
                if (err) reject(err);
                else resolve(row || { total_booking: 0, pending_booking: 0, confirmed_booking: 0 });
            });
        });
    }
}

module.exports = BookingRepo;
