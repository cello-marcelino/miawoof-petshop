const fs = require('fs');
const path = require('path');
const AssetRepo = require('../repositories/AssetRepo');
const UploadHandler = require('../utils/UploadHandler');
const SessionManager = require('../utils/SessionManager');

const UPLOADS_DIR = path.resolve(__dirname, '../../public/uploads');

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
            const parsedUrl = new URL(req.url, 'http://localhost');
            const kategori = parsedUrl.searchParams.get('kategori');
            const search = parsedUrl.searchParams.get('search');

            const assets = await AssetRepo.getAllAssets(kategori, search);

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
            const { filename, fields } = await UploadHandler.parseForm(req);
            if (!filename) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Tidak ada file gambar yang diunggah.' }));
            }

            const filePath = path.join(UPLOADS_DIR, filename);
            let fileSize = 0;
            if (fs.existsSync(filePath)) {
                fileSize = fs.statSync(filePath).size;
            }
            const sizeFormatted = AssetController.formatBytes(fileSize);

            // Determine category from form field or filename
            let reqKategori = fields && fields.kategori ? fields.kategori.toLowerCase() : null;
            if (!reqKategori || (reqKategori !== 'promosi' && reqKategori !== 'katalog')) {
                const isPromo = /^(banner|petads|slide|promo)/i.test(filename);
                reqKategori = isPromo ? 'promosi' : 'katalog';
            }

            const newAsset = await AssetRepo.createAsset({
                filename,
                file_url: `/uploads/${filename}`,
                kategori: reqKategori,
                file_size: fileSize,
                size_formatted: sizeFormatted,
                mime_type: 'image/' + (path.extname(filename).slice(1) || 'jpeg'),
                is_deletable: 1
            });

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'File gambar berhasil disimpan ke Database Galeri Asset.',
                data: newAsset
            }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleDeleteAsset(req, res, filename) {
        if (!SessionManager.requireAdmin(req, res, 'Akses khusus Admin.')) return;

        try {
            const safeFilename = path.basename(filename);
            
            // Check if asset is referenced by active products, slides, or packages
            const useCheck = await AssetRepo.isAssetInUse(safeFilename);
            if (useCheck.inUse) {
                const reasons = [];
                if (useCheck.productCount > 0) reasons.push(`${useCheck.productCount} Produk`);
                if (useCheck.slideCount > 0) reasons.push(`${useCheck.slideCount} Slide Promosi`);
                if (useCheck.paketCount > 0) reasons.push(`${useCheck.paketCount} Paket Grooming`);

                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                    success: false,
                    message: `Berkas gambar ini tidak dapat dihapus karena sedang aktif digunakan pada: ${reasons.join(', ')}.`
                }));
            }

            // Remove file from disk if in uploads
            const targetPath = path.join(UPLOADS_DIR, safeFilename);
            if (fs.existsSync(targetPath)) {
                try { fs.unlinkSync(targetPath); } catch (e) {}
            }

            // Remove record from database
            await AssetRepo.deleteAssetByFilename(safeFilename);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: `Berkas aset "${safeFilename}" berhasil dihapus secara permanen.` }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Gagal menghapus aset: ' + err.message }));
        }
    }
}

module.exports = AssetController;
