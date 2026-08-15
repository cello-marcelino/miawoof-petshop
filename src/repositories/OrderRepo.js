const db = require('../config/database');

class OrderRepo {
    static async getAllOrders(filters = {}) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT ps.id_pesanan, ps.jumlah, ps.total, ps.tgl_pesanan, ps.updated_at, ps.status,
                       ps.metode_pengambilan, ps.alamat_pengiriman, ps.no_hp_penerima, ps.catatan_pelanggan,
                       ps.catatan_admin, ps.komplain_text, ps.komplain_tanggapan,
                       pr.id_produk, pr.nama as nama_produk, pr.kategori, pr.harga, pr.gambar,
                       u.id as id_customer, u.full_name as customer_name, u.no_hp as customer_phone, u.alamat as customer_address, u.email
                FROM pesanan ps
                JOIN produk pr ON ps.id_produk = pr.id_produk
                JOIN users u ON ps.id_pembeli = u.id
                WHERE 1=1
            `;
            const params = [];

            if (filters.status && filters.status !== 'all') {
                sql += ' AND ps.status = ?';
                params.push(filters.status);
            }

            if (filters.metode && filters.metode !== 'all') {
                sql += ' AND ps.metode_pengambilan = ?';
                params.push(filters.metode);
            }

            if (filters.search) {
                sql += ' AND (pr.nama LIKE ? OR u.full_name LIKE ? OR ps.id_pesanan LIKE ?)';
                const term = `%${filters.search}%`;
                params.push(term, term, term);
            }

            sql += ' ORDER BY ps.id_pesanan DESC';

            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async getOrdersByCustomer(id_pembeli) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT ps.id_pesanan, ps.jumlah, ps.total, ps.tgl_pesanan, ps.updated_at, ps.status,
                       ps.metode_pengambilan, ps.alamat_pengiriman, ps.no_hp_penerima, ps.catatan_pelanggan,
                       ps.catatan_admin, ps.komplain_text, ps.komplain_tanggapan,
                       pr.id_produk, pr.nama as nama_produk, pr.kategori, pr.harga, pr.gambar
                FROM pesanan ps
                JOIN produk pr ON ps.id_produk = pr.id_produk
                WHERE ps.id_pembeli = ?
                ORDER BY ps.id_pesanan DESC
            `;
            db.all(sql, [id_pembeli], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async findById(id_pesanan) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT ps.*, pr.nama as nama_produk, pr.stock as current_stock, pr.harga, pr.gambar,
                       u.full_name as customer_name, u.no_hp as customer_phone, u.alamat as customer_address, u.email as customer_email
                FROM pesanan ps
                JOIN produk pr ON ps.id_produk = pr.id_produk
                JOIN users u ON ps.id_pembeli = u.id
                WHERE ps.id_pesanan = ?
            `;
            db.get(sql, [id_pesanan], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    /**
     * Create Order with Atomic Stock Deduction (ACID) + Pickup/Delivery
     */
    static async createOrderAtomic({ id_produk, id_pembeli, jumlah, total, metode_pengambilan, alamat_pengiriman, no_hp_penerima, catatan_pelanggan }) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // 1. Check stock
                db.get('SELECT stock, nama FROM produk WHERE id_produk = ?', [id_produk], (err, product) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                    }
                    if (!product || product.stock < jumlah) {
                        db.run('ROLLBACK');
                        return reject(new Error(`Stok produk "${product ? product.nama : ''}" tidak mencukupi (sisa: ${product ? product.stock : 0}).`));
                    }

                    // 2. Deduct stock
                    db.run('UPDATE produk SET stock = stock - ? WHERE id_produk = ?', [jumlah, id_produk], (stockErr) => {
                        if (stockErr) {
                            db.run('ROLLBACK');
                            return reject(stockErr);
                        }

                        // 3. Insert order
                        const orderSql = `
                            INSERT INTO pesanan (
                                id_produk, id_pembeli, jumlah, total, 
                                metode_pengambilan, alamat_pengiriman, no_hp_penerima, 
                                catatan_pelanggan, status, updated_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'menunggu_konfirmasi', CURRENT_TIMESTAMP)
                        `;
                        const params = [
                            id_produk, 
                            id_pembeli, 
                            jumlah, 
                            total, 
                            metode_pengambilan || 'ambil_ditoko', 
                            alamat_pengiriman || '', 
                            no_hp_penerima || '', 
                            catatan_pelanggan || ''
                        ];

                        db.run(orderSql, params, function (orderErr) {
                            if (orderErr) {
                                db.run('ROLLBACK');
                                return reject(orderErr);
                            }

                            const newOrderId = this.lastID;
                            db.run('COMMIT', (commitErr) => {
                                if (commitErr) {
                                    db.run('ROLLBACK');
                                    return reject(commitErr);
                                }
                                resolve({ id_pesanan: newOrderId, id_produk, jumlah, total, status: 'menunggu_konfirmasi' });
                            });
                        });
                    });
                });
            });
        });
    }

    /**
     * Admin or System Update Order Status & Notes
     */
    static async updateOrderStatus(id_pesanan, status, catatan_admin = null) {
        return new Promise((resolve, reject) => {
            let sql = 'UPDATE pesanan SET status = ?, updated_at = CURRENT_TIMESTAMP';
            const params = [status];

            if (catatan_admin !== null) {
                sql += ', catatan_admin = ?';
                params.push(catatan_admin);
            }
            sql += ' WHERE id_pesanan = ?';
            params.push(id_pesanan);

            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    /**
     * Admin Edit Full Order Details
     */
    static async updateOrderDetails(id_pesanan, { jumlah, total, status, catatan_admin, metode_pengambilan, alamat_pengiriman, no_hp_penerima }) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE pesanan 
                SET jumlah = ?, total = ?, status = ?, catatan_admin = ?, 
                    metode_pengambilan = ?, alamat_pengiriman = ?, no_hp_penerima = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id_pesanan = ?
            `;
            const params = [
                jumlah, 
                total, 
                status, 
                catatan_admin || '', 
                metode_pengambilan || 'ambil_ditoko', 
                alamat_pengiriman || '', 
                no_hp_penerima || '', 
                id_pesanan
            ];

            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    /**
     * Admin Delete Order (Restores Stock if not finished/cancelled)
     */
    static async deleteOrder(id_pesanan) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                db.get('SELECT id_produk, jumlah, status FROM pesanan WHERE id_pesanan = ?', [id_pesanan], (err, order) => {
                    if (err || !order) {
                        db.run('ROLLBACK');
                        return reject(err || new Error('Pesanan tidak ditemukan.'));
                    }

                    // If order wasn't completed or cancelled, restore stock
                    if (order.status !== 'selesai' && order.status !== 'dibatalkan') {
                        db.run('UPDATE produk SET stock = stock + ? WHERE id_produk = ?', [order.jumlah, order.id_produk]);
                    }

                    db.run('DELETE FROM pesanan WHERE id_pesanan = ?', [id_pesanan], function (delErr) {
                        if (delErr) {
                            db.run('ROLLBACK');
                            return reject(delErr);
                        }
                        db.run('COMMIT', () => resolve({ success: true, deleted: this.changes }));
                    });
                });
            });
        });
    }

    /**
     * Customer Confirms Order Received
     */
    static async confirmReceivedByCustomer(id_pesanan, id_pembeli) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE pesanan 
                SET status = 'selesai', updated_at = CURRENT_TIMESTAMP 
                WHERE id_pesanan = ? AND id_pembeli = ?
            `;
            db.run(sql, [id_pesanan, id_pembeli], function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    /**
     * Customer Submits Complaint
     */
    static async submitComplaint(id_pesanan, id_pembeli, komplain_text) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE pesanan 
                SET status = 'komplain', komplain_text = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id_pesanan = ? AND id_pembeli = ?
            `;
            db.run(sql, [komplain_text, id_pesanan, id_pembeli], function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    /**
     * Admin Responds to Complaint
     */
    static async respondComplaint(id_pesanan, komplain_tanggapan, newStatus = 'selesai') {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE pesanan 
                SET komplain_tanggapan = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id_pesanan = ?
            `;
            db.run(sql, [komplain_tanggapan, newStatus, id_pesanan], function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    /**
     * Customer Cancels Order
     */
    static async cancelOrderByCustomer(id_pesanan, id_pembeli) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                db.get('SELECT id_produk, jumlah, status FROM pesanan WHERE id_pesanan = ? AND id_pembeli = ?', [id_pesanan, id_pembeli], (err, order) => {
                    if (err || !order) {
                        db.run('ROLLBACK');
                        return reject(err || new Error('Pesanan tidak ditemukan.'));
                    }

                    if (order.status === 'selesai' || order.status === 'dalam_pengantaran') {
                        db.run('ROLLBACK');
                        return reject(new Error('Pesanan yang sudah dalam proses pengiriman atau selesai tidak dapat dibatalkan langsung.'));
                    }

                    // Restore stock
                    db.run('UPDATE produk SET stock = stock + ? WHERE id_produk = ?', [order.jumlah, order.id_produk], (restoreErr) => {
                        if (restoreErr) {
                            db.run('ROLLBACK');
                            return reject(restoreErr);
                        }

                        db.run('UPDATE pesanan SET status = "dibatalkan", updated_at = CURRENT_TIMESTAMP WHERE id_pesanan = ?', [id_pesanan], (updateErr) => {
                            if (updateErr) {
                                db.run('ROLLBACK');
                                return reject(updateErr);
                            }
                            db.run('COMMIT', () => resolve({ success: true }));
                        });
                    });
                });
            });
        });
    }

    static async countOrderStats() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    COUNT(*) as total_pesanan,
                    SUM(CASE WHEN status = 'selesai' THEN total ELSE 0 END) as total_pendapatan,
                    SUM(CASE WHEN status = 'menunggu_konfirmasi' THEN 1 ELSE 0 END) as pending_pesanan,
                    SUM(CASE WHEN status = 'disiapkan_di_toko' THEN 1 ELSE 0 END) as siap_toko_pesanan,
                    SUM(CASE WHEN status = 'dalam_pengantaran' THEN 1 ELSE 0 END) as antar_pesanan,
                    SUM(CASE WHEN status = 'komplain' THEN 1 ELSE 0 END) as komplain_pesanan
                FROM pesanan
            `;
            db.get(sql, [], (err, row) => {
                if (err) reject(err);
                else resolve(row || { total_pesanan: 0, total_pendapatan: 0, pending_pesanan: 0, siap_toko_pesanan: 0, antar_pesanan: 0, komplain_pesanan: 0 });
            });
        });
    }
}

module.exports = OrderRepo;
