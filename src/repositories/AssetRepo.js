const fs = require('fs');
const path = require('path');
const db = require('../config/database');

class AssetRepo {
    static formatBytes(bytes, decimals = 1) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    static async syncOrGetAsset(imagePath, defaultKategori = 'katalog') {
        if (!imagePath || typeof imagePath !== 'string') return null;
        if (imagePath.includes('default_product.png') || imagePath.includes('placeholder')) return null;

        const filename = path.basename(imagePath);
        const fileUrl = imagePath.startsWith('/') ? imagePath : `/uploads/${filename}`;
        
        // 1. Cek apakah sudah terdaftar di media_assets
        const existing = await this.getAssetByUrlOrFilename(filename);
        if (existing) {
            return existing.id_asset;
        }

        // 2. Jika belum, hitung ukuran file & tentukan kategori
        const uploadPath = path.resolve(__dirname, '../../public/uploads', filename);
        const bannerPath = path.resolve(__dirname, '../../public/images/banners', filename);
        let fileSize = 0;

        if (fs.existsSync(uploadPath)) {
            try { fileSize = fs.statSync(uploadPath).size; } catch (e) {}
        } else if (fs.existsSync(bannerPath)) {
            try { fileSize = fs.statSync(bannerPath).size; } catch (e) {}
        }

        let kategori = defaultKategori;
        if (fileUrl.startsWith('/images/banners/') || /^(banner|petads|slide|promo)/i.test(filename)) {
            kategori = 'promosi';
        }

        const sizeFormatted = AssetRepo.formatBytes(fileSize);
        const ext = path.extname(filename).slice(1) || 'jpeg';

        const newAsset = await this.createAsset({
            filename,
            file_url: fileUrl,
            kategori,
            file_size: fileSize,
            size_formatted: sizeFormatted,
            mime_type: 'image/' + ext,
            is_deletable: fileUrl.startsWith('/images/banners/') ? 0 : 1
        });

        return newAsset ? newAsset.id_asset : null;
    }
    static async getAllAssets(kategori = null, search = null) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT id_asset, filename, file_url, kategori, file_size, size_formatted, mime_type, is_deletable, created_at
                FROM media_assets
                WHERE 1=1
            `;
            const params = [];

            if (kategori && (kategori === 'promosi' || kategori === 'katalog')) {
                sql += ' AND kategori = ?';
                params.push(kategori);
            }

            if (search && search.trim() !== '') {
                sql += ' AND (filename LIKE ? OR kategori LIKE ?)';
                const term = `%${search.trim()}%`;
                params.push(term, term);
            }

            sql += ' ORDER BY id_asset DESC';

            db.all(sql, params, (err, rows) => {
                if (err) return reject(err);
                const assets = (rows || []).map(r => ({
                    id_asset: r.id_asset,
                    filename: r.filename,
                    url: r.file_url,
                    kategori: r.kategori,
                    kategoriLabel: r.kategori === 'promosi' ? 'Promosi & Banner' : 'Katalog Produk',
                    size: r.file_size,
                    sizeFormatted: r.size_formatted || '0 B',
                    mimeType: r.mime_type,
                    isDeletable: r.is_deletable === 1,
                    folder: r.file_url.startsWith('/images/banners/') ? 'banners' : 'uploads',
                    createdAt: r.created_at
                }));
                resolve(assets);
            });
        });
    }

    static async getAssetById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM media_assets WHERE id_asset = ?';
            db.get(sql, [id], (err, row) => {
                if (err) return reject(err);
                if (!row) return resolve(null);
                resolve({
                    id_asset: row.id_asset,
                    filename: row.filename,
                    url: row.file_url,
                    kategori: row.kategori,
                    kategoriLabel: row.kategori === 'promosi' ? 'Promosi & Banner' : 'Katalog Produk',
                    size: row.file_size,
                    sizeFormatted: row.size_formatted,
                    mimeType: row.mime_type,
                    isDeletable: row.is_deletable === 1,
                    folder: row.file_url.startsWith('/images/banners/') ? 'banners' : 'uploads',
                    createdAt: row.created_at
                });
            });
        });
    }

    static async getAssetByUrlOrFilename(identifier) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM media_assets WHERE file_url = ? OR filename = ? LIMIT 1';
            db.get(sql, [identifier, identifier], (err, row) => {
                if (err) return reject(err);
                if (!row) return resolve(null);
                resolve(row);
            });
        });
    }

    static async createAsset({ filename, file_url, kategori = 'katalog', file_size = 0, size_formatted = '0 B', mime_type = 'image/jpeg', is_deletable = 1 }) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO media_assets (filename, file_url, kategori, file_size, size_formatted, mime_type, is_deletable)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            db.run(sql, [filename, file_url, kategori, file_size, size_formatted, mime_type, is_deletable], function (err) {
                if (err) return reject(err);
                resolve({
                    id_asset: this.lastID,
                    filename,
                    url: file_url,
                    kategori,
                    kategoriLabel: kategori === 'promosi' ? 'Promosi & Banner' : 'Katalog Produk',
                    size: file_size,
                    sizeFormatted: size_formatted,
                    mimeType: mime_type,
                    isDeletable: is_deletable === 1
                });
            });
        });
    }

    static async deleteAssetByFilename(filename) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM media_assets WHERE filename = ? AND is_deletable = 1';
            db.run(sql, [filename], function (err) {
                if (err) return reject(err);
                resolve(this.changes > 0);
            });
        });
    }

    static async isAssetInUse(identifier) {
        return new Promise((resolve, reject) => {
            const filename = identifier.replace(/^\/(uploads|images\/banners)\//, '');
            const checkSql = `
                SELECT 
                    (SELECT COUNT(*) FROM produk WHERE gambar LIKE ? OR id_asset IN (SELECT id_asset FROM media_assets WHERE filename = ? OR file_url = ?)) as prod_count,
                    (SELECT COUNT(*) FROM slides WHERE gambar LIKE ? OR id_asset IN (SELECT id_asset FROM media_assets WHERE filename = ? OR file_url = ?)) as slide_count,
                    (SELECT COUNT(*) FROM paket_grooming WHERE gambar LIKE ? OR id_asset IN (SELECT id_asset FROM media_assets WHERE filename = ? OR file_url = ?)) as paket_count
            `;
            const term = `%${filename}%`;
            db.get(checkSql, [term, filename, identifier, term, filename, identifier, term, filename, identifier], (err, row) => {
                if (err) return reject(err);
                const totalUse = (row ? (row.prod_count + row.slide_count + row.paket_count) : 0);
                resolve({
                    inUse: totalUse > 0,
                    productCount: row ? row.prod_count : 0,
                    slideCount: row ? row.slide_count : 0,
                    paketCount: row ? row.paket_count : 0
                });
            });
        });
    }
}

module.exports = AssetRepo;
