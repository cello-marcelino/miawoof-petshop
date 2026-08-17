const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const UploadHandler = require('../utils/UploadHandler');
const SessionManager = require('../utils/SessionManager');

const UPLOADS_DIR = path.resolve(__dirname, '../../public/uploads');
const BANNERS_DIR = path.resolve(__dirname, '../../public/images/banners');

class AssetController {
    static formatBytes(bytes, decimals = 1) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    static async handleGetAssets(req, res) {
        if (!SessionManager.requireAdmin(req, res, 'Akses khusus Admin.')) return;

        try {
            // Retrieve image lists from database to classify categories accurately
            const [productRows, slideRows] = await Promise.all([
                new Promise(r => db.all('SELECT gambar FROM produk', [], (e, rows) => r(rows || []))),
                new Promise(r => db.all('SELECT gambar FROM slides', [], (e, rows) => r(rows || [])))
            ]);

            const productImgSet = new Set(
                productRows.map(p => path.basename(p.gambar || ''))
            );
            const slideImgSet = new Set(
                slideRows.map(s => path.basename(s.gambar || ''))
            );

            const assets = [];

            // 1. Scan uploads directory
            if (fs.existsSync(UPLOADS_DIR)) {
                const uploadFiles = fs.readdirSync(UPLOADS_DIR);
                for (const file of uploadFiles) {
                    const filePath = path.join(UPLOADS_DIR, file);
                    try {
                        const stat = fs.statSync(filePath);
                        if (stat.isFile() && /\.(jpg|jpeg|png|webp|jfif|svg)$/i.test(file)) {
                            // Determine category: banner* and petAds* (and slide/promo) are promosi, rest are katalog
                            const isPromosi = /^(banner|petads|slide|promo)/i.test(file) || slideImgSet.has(file);
                            const kategori = isPromosi ? 'promosi' : 'katalog';
                            const kategoriLabel = isPromosi ? 'Promosi & Banner' : 'Katalog Produk';

                            assets.push({
                                filename: file,
                                url: `/uploads/${file}`,
                                path: filePath,
                                size: stat.size,
                                sizeFormatted: AssetController.formatBytes(stat.size),
                                mtime: stat.mtime,
                                isDeletable: true,
                                folder: 'uploads',
                                kategori,
                                kategoriLabel
                            });
                        }
                    } catch (statErr) {}
                }
            }

            // 2. Scan preset banners directory
            if (fs.existsSync(BANNERS_DIR)) {
                const bannerFiles = fs.readdirSync(BANNERS_DIR);
                for (const file of bannerFiles) {
                    const filePath = path.join(BANNERS_DIR, file);
                    try {
                        const stat = fs.statSync(filePath);
                        if (stat.isFile() && /\.(jpg|jpeg|png|webp|jfif|svg)$/i.test(file)) {
                            assets.push({
                                filename: file,
                                url: `/images/banners/${file}`,
                                path: filePath,
                                size: stat.size,
                                sizeFormatted: AssetController.formatBytes(stat.size),
                                mtime: stat.mtime,
                                isDeletable: false, // Preset banners are protected
                                folder: 'banners',
                                kategori: 'promosi',
                                kategoriLabel: 'Promosi & Banner'
                            });
                        }
                    } catch (statErr) {}
                }
            }

            // Sort newest first
            assets.sort((a, b) => new Date(b.mtime) - new Date(a.mtime));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: assets }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Gagal memuat galeri aset: ' + err.message }));
        }
    }

    static async handleUploadAsset(req, res) {
        if (!SessionManager.requireAdmin(req, res, 'Akses khusus Admin.')) return;

        try {
            const { filename } = await UploadHandler.parseForm(req);
            if (!filename) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Tidak ada file gambar yang diunggah.' }));
            }

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'File gambar berhasil diunggah ke Galeri Asset.',
                data: {
                    filename,
                    url: `/uploads/${filename}`
                }
            }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleDeleteAsset(req, res, filename) {
        if (!SessionManager.requireAdmin(req, res, 'Akses khusus Admin.')) return;

        try {
            // Prevent Directory Traversal Attack
            const safeFilename = path.basename(filename);
            const targetPath = path.join(UPLOADS_DIR, safeFilename);

            if (!fs.existsSync(targetPath)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'File aset tidak ditemukan di server.' }));
            }

            fs.unlinkSync(targetPath);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: `File asset "${safeFilename}" berhasil dihapus dari server.` }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Gagal menghapus file: ' + err.message }));
        }
    }
}

module.exports = AssetController;
