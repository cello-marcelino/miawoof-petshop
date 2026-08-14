const db = require('../config/database');

class ProductRepo {
    static async getAllProducts(kategori = null, search = null) {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT * FROM produk WHERE 1=1';
            const params = [];

            if (kategori && (kategori === 'kucing' || kategori === 'anjing')) {
                sql += ' AND kategori = ?';
                params.push(kategori);
            }

            if (search && search.trim() !== '') {
                sql += ' AND nama LIKE ?';
                params.push(`%${search.trim()}%`);
            }

            sql += ' ORDER BY id_produk DESC';

            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM produk WHERE id_produk = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async createProduct({ nama, kategori, stock, harga, gambar, tgl_expired }) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO produk (nama, kategori, stock, harga, gambar, tgl_expired) VALUES (?, ?, ?, ?, ?, ?)`;
            db.run(sql, [nama, kategori, stock, harga, gambar, tgl_expired], function (err) {
                if (err) reject(err);
                else resolve({ id_produk: this.lastID, nama, stock, harga });
            });
        });
    }

    static async updateProduct(id, { nama, kategori, stock, harga, gambar, tgl_expired }) {
        return new Promise((resolve, reject) => {
            let sql = 'UPDATE produk SET nama = ?, kategori = ?, stock = ?, harga = ?, tgl_expired = ?';
            const params = [nama, kategori, stock, harga, tgl_expired];

            if (gambar) {
                sql += ', gambar = ?';
                params.push(gambar);
            }
            sql += ' WHERE id_produk = ?';
            params.push(id);

            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    static async deleteProduct(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM produk WHERE id_produk = ?', [id], function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    static async countProducts() {
        return new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as total_produk, SUM(stock) as total_stok FROM produk', [], (err, row) => {
                if (err) reject(err);
                else resolve(row || { total_produk: 0, total_stok: 0 });
            });
        });
    }
}

module.exports = ProductRepo;
