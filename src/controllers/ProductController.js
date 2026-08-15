const ProductService = require('../services/ProductService');
const UploadHandler = require('../utils/UploadHandler');
const SessionManager = require('../utils/SessionManager');

class ProductController {
    static async handleGetProducts(req, res, queryParams) {
        try {
            const kategori = queryParams.get('kategori') || null;
            const search = queryParams.get('search') || null;
            const products = await ProductService.getAllProducts(kategori, search);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: products }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleGetProductById(req, res, id) {
        try {
            const product = await ProductService.getProductById(id);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: product }));
        } catch (err) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleCreateProduct(req, res) {
        const session = SessionManager.getSession(req);
        if (!session || session.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Admin yang dapat menambah produk.' }));
        }

        try {
            const contentType = req.headers['content-type'] || '';
            let fields = {};
            let filename = null;

            if (contentType.includes('multipart/form-data')) {
                const parsed = await UploadHandler.parseForm(req);
                fields = parsed.fields;
                filename = parsed.filename;
            } else {
                fields = await new Promise((resolve, reject) => {
                    let body = '';
                    req.on('data', chunk => { body += chunk.toString(); });
                    req.on('end', () => {
                        try { resolve(body ? JSON.parse(body) : {}); }
                        catch (e) { resolve({}); }
                    });
                    req.on('error', reject);
                });
            }

            const newProduct = await ProductService.createProduct(fields, filename);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Produk berhasil ditambahkan!', data: newProduct }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleUpdateProduct(req, res, id) {
        const session = SessionManager.getSession(req);
        if (!session || session.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Admin yang dapat mengubah produk.' }));
        }

        try {
            const contentType = req.headers['content-type'] || '';
            let fields = {};
            let filename = null;

            if (contentType.includes('multipart/form-data')) {
                const parsed = await UploadHandler.parseForm(req);
                fields = parsed.fields;
                filename = parsed.filename;
            } else {
                fields = await new Promise((resolve, reject) => {
                    let body = '';
                    req.on('data', chunk => { body += chunk.toString(); });
                    req.on('end', () => {
                        try { resolve(body ? JSON.parse(body) : {}); }
                        catch (e) { resolve({}); }
                    });
                    req.on('error', reject);
                });
            }

            await ProductService.updateProduct(id, fields, filename);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Data produk berhasil diperbarui!' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleDeleteProduct(req, res, id) {
        const session = SessionManager.getSession(req);
        if (!session || session.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Admin yang dapat menghapus produk.' }));
        }

        try {
            await ProductService.deleteProduct(id);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Produk berhasil dihapus.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }
}

module.exports = ProductController;
