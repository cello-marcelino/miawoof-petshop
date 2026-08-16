const ProductService = require('../services/ProductService');
const SessionManager = require('../utils/SessionManager');
const { parseRequestPayload } = require('../utils/BodyParser');

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
        if (!SessionManager.requireAdmin(req, res, 'Akses ditolak: Hanya Admin yang dapat menambah produk.')) return;

        try {
            const { fields, filename } = await parseRequestPayload(req);
            const newProduct = await ProductService.createProduct(fields, filename);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Produk berhasil ditambahkan!', data: newProduct }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleUpdateProduct(req, res, id) {
        if (!SessionManager.requireAdmin(req, res, 'Akses ditolak: Hanya Admin yang dapat mengubah produk.')) return;

        try {
            const { fields, filename } = await parseRequestPayload(req);
            await ProductService.updateProduct(id, fields, filename);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Data produk berhasil diperbarui!' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleDeleteProduct(req, res, id) {
        if (!SessionManager.requireAdmin(req, res, 'Akses ditolak: Hanya Admin yang dapat menghapus produk.')) return;

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

