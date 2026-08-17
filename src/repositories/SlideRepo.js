const db = require('../config/database');

class SlideRepo {
    static async getAllSlides(onlyActive = false) {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT * FROM slides';
            const params = [];
            if (onlyActive) {
                sql += ' WHERE is_active = 1';
            }
            sql += ' ORDER BY urutan ASC, id_slide DESC';

            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async findById(id_slide) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM slides WHERE id_slide = ?', [id_slide], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async createSlide({ judul, subjudul, gambar, id_asset, link_url, urutan, is_active }) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO slides (judul, subjudul, gambar, id_asset, link_url, urutan, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            db.run(sql, [judul, subjudul || '', gambar, id_asset || null, link_url || '/produk', urutan || 0, is_active !== undefined ? is_active : 1], function (err) {
                if (err) reject(err);
                else resolve({ id_slide: this.lastID, judul, gambar, id_asset });
            });
        });
    }

    static async updateSlide(id_slide, { judul, subjudul, gambar, id_asset, link_url, urutan, is_active }) {
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE slides 
                SET judul = ?, subjudul = ?, link_url = ?, urutan = ?, is_active = ?
            `;
            const params = [judul, subjudul || '', link_url || '/produk', urutan || 0, is_active !== undefined ? is_active : 1];

            if (gambar) {
                sql += ', gambar = ?, id_asset = ?';
                params.push(gambar, id_asset || null);
            }
            sql += ' WHERE id_slide = ?';
            params.push(id_slide);

            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    static async toggleActive(id_slide) {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE slides SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id_slide = ?';
            db.run(sql, [id_slide], function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    static async deleteSlide(id_slide) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM slides WHERE id_slide = ?', [id_slide], function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }
}

module.exports = SlideRepo;
