const db = require('../config/database');

class BookingRepo {
    // ================= Paket Grooming CRUD =================
    static async getAllPaket() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM paket_grooming ORDER BY id_paket ASC', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
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

    static async createPaket({ nama_paket, jenis_hewan, harga, durasi_menit, keterangan_grooming, gambar, id_asset }) {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO paket_grooming (nama_paket, jenis_hewan, harga, durasi_menit, keterangan_grooming, gambar, id_asset) VALUES (?, ?, ?, ?, ?, ?, ?)';
            db.run(sql, [nama_paket, jenis_hewan, harga, durasi_menit || 60, keterangan_grooming, gambar || null, id_asset || null], function (err) {
                if (err) reject(err);
                else resolve({ id_paket: this.lastID, nama_paket, harga, id_asset });
            });
        });
    }

    static async updatePaket(id_paket, { nama_paket, jenis_hewan, harga, durasi_menit, keterangan_grooming, gambar, id_asset }) {
        return new Promise((resolve, reject) => {
            let sql = 'UPDATE paket_grooming SET nama_paket = ?, jenis_hewan = ?, harga = ?, durasi_menit = ?, keterangan_grooming = ?';
            const params = [nama_paket, jenis_hewan, harga, durasi_menit || 60, keterangan_grooming];
            if (gambar) {
                sql += ', gambar = ?, id_asset = ?';
                params.push(gambar, id_asset || null);
            }
            sql += ' WHERE id_paket = ?';
            params.push(id_paket);

            db.run(sql, params, function (err) {
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
    static async getAllBookings(filters = {}) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT b.id_booking, 
                       COALESCE(b.nama_hewan, 'Anabul') as nama_hewan, 
                       COALESCE(b.jenis_hewan, p.jenis_hewan, 'kucing') as jenis_hewan, 
                       b.tgl_booking, b.waktu, b.catatan, b.catatan_admin, b.status, b.created_at,
                       p.id_paket, 
                       COALESCE(p.nama_paket, 'Paket Grooming') as nama_paket, 
                       COALESCE(p.harga, 0) as harga, 
                       COALESCE(p.durasi_menit, 60) as durasi_menit, 
                       COALESCE(p.keterangan_grooming, '') as keterangan_grooming,
                       u.id as id_customer, 
                       COALESCE(u.full_name, 'Pelanggan') as customer_name, 
                       COALESCE(u.no_hp, '-') as customer_phone, 
                       COALESCE(u.email, '-') as customer_email
                FROM booking b
                LEFT JOIN paket_grooming p ON b.id_paket = p.id_paket
                LEFT JOIN users u ON b.id_customer = u.id
                WHERE 1=1
            `;
            const params = [];

            if (filters.status && filters.status !== 'all') {
                if (filters.status === 'menunggu_konfirmasi') {
                    sql += " AND (b.status = 'menunggu_konfirmasi' OR b.status = 'menunggu konfirmasi')";
                } else {
                    sql += ' AND b.status = ?';
                    params.push(filters.status);
                }
            }
            if (filters.search) {
                sql += ' AND (u.full_name LIKE ? OR p.nama_paket LIKE ? OR b.nama_hewan LIKE ?)';
                const term = `%${filters.search}%`;
                params.push(term, term, term);
            }

            sql += ' ORDER BY b.id_booking DESC';

            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    static async getBookingsByCustomer(id_customer) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT b.id_booking, 
                       COALESCE(b.nama_hewan, 'Anabul') as nama_hewan, 
                       COALESCE(b.jenis_hewan, p.jenis_hewan, 'kucing') as jenis_hewan, 
                       b.tgl_booking, b.waktu, b.catatan, b.catatan_admin, b.status, b.created_at,
                       p.id_paket, 
                       COALESCE(p.nama_paket, 'Paket Grooming') as nama_paket, 
                       COALESCE(p.harga, 0) as harga, 
                       COALESCE(p.durasi_menit, 60) as durasi_menit, 
                       COALESCE(p.keterangan_grooming, '') as keterangan_grooming
                FROM booking b
                LEFT JOIN paket_grooming p ON b.id_paket = p.id_paket
                WHERE b.id_customer = ?
                ORDER BY b.id_booking DESC
            `;
            db.all(sql, [id_customer], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    static async findBookingById(id_booking) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT b.*, p.nama_paket, p.harga, p.durasi_menit, u.full_name as customer_name, u.no_hp as customer_phone, u.email as customer_email
                FROM booking b
                LEFT JOIN paket_grooming p ON b.id_paket = p.id_paket
                LEFT JOIN users u ON b.id_customer = u.id
                WHERE b.id_booking = ?
            `;
            db.get(sql, [id_booking], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async createBooking({ id_paket, id_customer, nama_hewan, jenis_hewan, tgl_booking, waktu, catatan }) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO booking (id_paket, id_customer, nama_hewan, jenis_hewan, tgl_booking, waktu, catatan, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 'menunggu_konfirmasi')
            `;
            db.run(sql, [id_paket, id_customer, nama_hewan || 'Anabul', jenis_hewan || 'kucing', tgl_booking, waktu, catatan || ''], function (err) {
                if (err) reject(err);
                else resolve({ id_booking: this.lastID });
            });
        });
    }

    static async updateBookingStatus(id_booking, status, catatan_admin = null) {
        return new Promise((resolve, reject) => {
            let sql = 'UPDATE booking SET status = ?';
            const params = [status];
            if (catatan_admin !== null) {
                sql += ', catatan_admin = ?';
                params.push(catatan_admin);
            }
            sql += ' WHERE id_booking = ?';
            params.push(id_booking);

            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    static async deleteBooking(id_booking) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM booking WHERE id_booking = ?', [id_booking], function (err) {
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
                    SUM(CASE WHEN status = 'menunggu_konfirmasi' OR status = 'menunggu konfirmasi' THEN 1 ELSE 0 END) as pending_booking,
                    SUM(CASE WHEN status = 'dikonfirmasi' THEN 1 ELSE 0 END) as confirmed_booking,
                    SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) as finished_booking
                FROM booking
            `, [], (err, row) => {
                if (err) reject(err);
                else resolve(row || { total_booking: 0, pending_booking: 0, confirmed_booking: 0, finished_booking: 0 });
            });
        });
    }
}

module.exports = BookingRepo;
