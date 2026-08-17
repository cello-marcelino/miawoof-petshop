const fs = require('fs');
const path = require('path');
const ProductRepo = require('../repositories/ProductRepo');
const AssetRepo = require('../repositories/AssetRepo');

class ProductService {
    static async getAllProducts(kategori = null, search = null) {
        return await ProductRepo.getAllProducts(kategori, search);
    }

    static async getProductById(id) {
        const product = await ProductRepo.findById(id);
        if (!product) {
            throw new Error('Produk tidak ditemukan.');
        }
        return product;
    }

    static async createProduct(fields, uploadedFilename = null) {
        const cleanNama = (fields.nama || fields.nama_produk || '').trim();
        const rawStock = fields.stock !== undefined ? fields.stock : fields.stok;
        const numStock = parseInt(rawStock, 10);
        const numHarga = parseInt(fields.harga, 10);
        const kategori = (fields.kategori || 'kucing').toLowerCase();
        const exp = fields.tgl_expired || fields.exp || null;

        if (!cleanNama || isNaN(numStock) || isNaN(numHarga)) {
            throw new Error('Nama produk, stok, dan harga wajib diisi secara valid.');
        }

        if (numStock < 0 || numHarga < 0) {
            throw new Error('Stok dan harga produk tidak boleh bernilai negatif.');
        }

        if (kategori !== 'kucing' && kategori !== 'anjing') {
            throw new Error('Kategori hewan harus berupa "kucing" atau "anjing".');
        }

        // Determine image URL
        let finalGambar = '/images/products/cat_food1.jpg';
        if (uploadedFilename) {
            finalGambar = `/uploads/${uploadedFilename}`;
        } else if (fields.existing_gambar_url || fields.gambar) {
            finalGambar = fields.existing_gambar_url || fields.gambar;
        }

        // Automatically sync with Media Asset Master Table (kategori: katalog)
        const idAsset = await AssetRepo.syncOrGetAsset(finalGambar, 'katalog');

        return await ProductRepo.createProduct({
            nama: cleanNama,
            kategori,
            stock: numStock,
            harga: numHarga,
            gambar: finalGambar,
            id_asset: idAsset,
            tgl_expired: exp
        });
    }

    static async updateProduct(id, fields, uploadedFilename = null) {
        const existing = await this.getProductById(id); // Ensure product exists

        const rawNama = fields.nama || fields.nama_produk || existing.nama;
        const cleanNama = (rawNama || '').trim();
        const rawStock = fields.stock !== undefined ? fields.stock : (fields.stok !== undefined ? fields.stok : existing.stock);
        const numStock = parseInt(rawStock, 10);
        const numHarga = fields.harga !== undefined ? parseInt(fields.harga, 10) : existing.harga;
        const kategori = (fields.kategori || existing.kategori || 'kucing').toLowerCase();
        const exp = fields.tgl_expired || fields.exp || existing.tgl_expired;

        if (!cleanNama || isNaN(numStock) || isNaN(numHarga)) {
            throw new Error('Nama produk, stok, dan harga wajib diisi secara valid.');
        }

        let newGambar = null;
        let idAsset = existing.id_asset || null;

        if (uploadedFilename) {
            newGambar = `/uploads/${uploadedFilename}`;
        } else if (fields.existing_gambar_url) {
            newGambar = fields.existing_gambar_url;
        } else if (fields.gambar) {
            newGambar = fields.gambar;
        }

        if (newGambar) {
            idAsset = await AssetRepo.syncOrGetAsset(newGambar, 'katalog');
        }

        // Optional delete old image if requested and new image is provided
        const deleteOld = fields.delete_old_image === true || fields.delete_old_image === 'true';
        if (deleteOld && newGambar && existing.gambar && existing.gambar !== newGambar) {
            if (existing.gambar.startsWith('/uploads/')) {
                const oldFilename = path.basename(existing.gambar);
                const oldPath = path.join(__dirname, '../../public/uploads', oldFilename);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch (e) {}
                }
            }
        }

        return await ProductRepo.updateProduct(id, {
            nama: cleanNama,
            kategori,
            stock: numStock,
            harga: numHarga,
            gambar: newGambar,
            id_asset: idAsset,
            tgl_expired: exp
        });
    }

    static async deleteProduct(id) {
        await this.getProductById(id);
        return await ProductRepo.deleteProduct(id);
    }
}

module.exports = ProductService;
