const db = require('../config/database');

class ProductRepo {
    static async getAllProducts(kategori = null, search = null) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT id_produk, nama, kategori, stock, harga, gambar, tgl_dibuat, tgl_expired
                FROM produk
                WHERE 1=1
            `;
            const params = [];

            if (kategori && (kategori === 'kucing' || kategori === 'anjing')) {
                sql += ' AND kategori = ?';
                params.push(kategori);
            }

            if (search && search.trim() !== '') {
                sql += ' AND (nama LIKE ? OR kategori LIKE ?)';
                const term = `%${search.trim()}%`;
                params.push(term, term);
            }

            sql += ' ORDER BY id_produk DESC';

            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve((rows || []).map(r => ProductRepo.normalizeProductRow(r)));
            });
        });
    }

    static normalizeProductRow(row) {
        if (!row) return null;
        let gambar = row.gambar;
        if (gambar && !gambar.startsWith('/') && !gambar.startsWith('http://') && !gambar.startsWith('https://')) {
            gambar = '/uploads/' + gambar;
        } else if (!gambar) {
            gambar = '/images/placeholders/default_product.png';
        }
        return {
            ...row,
            gambar
        };
    }

    static async findById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id_produk, nama, kategori, stock, harga, gambar, tgl_dibuat, tgl_expired
                FROM produk
                WHERE id_produk = ?
            `;
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row ? ProductRepo.normalizeProductRow(row) : null);
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
