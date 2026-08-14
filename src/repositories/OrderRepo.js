const db = require('../config/database');

class OrderRepo {
    static async getAllOrders() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT ps.id_pesanan, ps.jumlah, ps.total, ps.tgl_pesanan, ps.status,
                       pr.id_produk, pr.nama as nama_produk, pr.kategori, pr.harga, pr.gambar,
                       u.id as id_customer, u.full_name as customer_name, u.no_hp, u.alamat, u.email
                FROM pesanan ps
                JOIN produk pr ON ps.id_produk = pr.id_produk
                JOIN users u ON ps.id_pembeli = u.id
                ORDER BY ps.id_pesanan DESC
            `;
            db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async getOrdersByCustomer(id_pembeli) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT ps.id_pesanan, ps.jumlah, ps.total, ps.tgl_pesanan, ps.status,
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
                SELECT ps.*, pr.nama as nama_produk, pr.stock as current_stock, pr.harga
                FROM pesanan ps
                JOIN produk pr ON ps.id_produk = pr.id_produk
                WHERE ps.id_pesanan = ?
            `;
            db.get(sql, [id_pesanan], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    /**
     * Create Order with Atomic Stock Deduction (ACID)
     */
    static async createOrderAtomic(id_produk, id_pembeli, jumlah, total) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // 1. Check stock
                db.get('SELECT stock FROM produk WHERE id_produk = ?', [id_produk], (err, product) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                    }
                    if (!product || product.stock < jumlah) {
                        db.run('ROLLBACK');
                        return reject(new Error(`Stok produk tidak mencukupi (sisa: ${product ? product.stock : 0}).`));
                    }

                    // 2. Deduct stock
                    db.run('UPDATE produk SET stock = stock - ? WHERE id_produk = ?', [jumlah, id_produk], (stockErr) => {
                        if (stockErr) {
                            db.run('ROLLBACK');
                            return reject(stockErr);
                        }

                        // 3. Insert order
                        const orderSql = 'INSERT INTO pesanan (id_produk, id_pembeli, jumlah, total, status) VALUES (?, ?, ?, ?, "menunggu pembayaran")';
                        db.run(orderSql, [id_produk, id_pembeli, jumlah, total], function (orderErr) {
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
                                resolve({ id_pesanan: newOrderId, id_produk, jumlah, total, status: 'menunggu pembayaran' });
                            });
                        });
                    });
                });
            });
        });
    }

    static async updateOrderStatus(id_pesanan, status) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE pesanan SET status = ? WHERE id_pesanan = ?', [status, id_pesanan], function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    static async cancelOrderByCustomer(id_pesanan, id_pembeli) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // Get order to restore stock
                db.get('SELECT id_produk, jumlah, status FROM pesanan WHERE id_pesanan = ? AND id_pembeli = ?', [id_pesanan, id_pembeli], (err, order) => {
                    if (err || !order) {
                        db.run('ROLLBACK');
                        return reject(err || new Error('Pesanan tidak ditemukan.'));
                    }

                    if (order.status === 'selesai') {
                        db.run('ROLLBACK');
                        return reject(new Error('Pesanan yang sudah selesai tidak dapat dibatalkan.'));
                    }

                    // Restore stock
                    db.run('UPDATE produk SET stock = stock + ? WHERE id_produk = ?', [order.jumlah, order.id_produk], (restoreErr) => {
                        if (restoreErr) {
                            db.run('ROLLBACK');
                            return reject(restoreErr);
                        }

                        // Mark as dibatalkan
                        db.run('UPDATE pesanan SET status = "dibatalkan" WHERE id_pesanan = ?', [id_pesanan], (updateErr) => {
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
                    SUM(CASE WHEN status = 'menunggu pembayaran' THEN 1 ELSE 0 END) as pending_pesanan,
                    SUM(CASE WHEN status = 'diproses' THEN 1 ELSE 0 END) as proses_pesanan
                FROM pesanan
            `;
            db.get(sql, [], (err, row) => {
                if (err) reject(err);
                else resolve(row || { total_pesanan: 0, total_pendapatan: 0, pending_pesanan: 0, proses_pesanan: 0 });
            });
        });
    }
}

module.exports = OrderRepo;
