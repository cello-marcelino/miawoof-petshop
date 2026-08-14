const ProductRepo = require('../repositories/ProductRepo');
const Sanitizer = require('../utils/Sanitizer');

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

    static async createProduct({ nama, kategori, stock, harga, tgl_expired }, uploadedFilename = null) {
        const cleanNama = Sanitizer.cleanInput(nama);
        const numStock = parseInt(stock, 10);
        const numHarga = parseInt(harga, 10);

        if (!cleanNama || isNaN(numStock) || isNaN(numHarga)) {
            throw new Error('Nama produk, stok, dan harga wajib diisi secara valid.');
        }

        if (numStock < 0 || numHarga < 0) {
            throw new Error('Stok dan harga produk tidak boleh bernilai negatif.');
        }

        if (kategori !== 'kucing' && kategori !== 'anjing') {
            throw new Error('Kategori hewan harus berupa "kucing" atau "anjing".');
        }

        return await ProductRepo.createProduct({
            nama: cleanNama,
            kategori,
            stock: numStock,
            harga: numHarga,
            gambar: uploadedFilename || 'dummy_product.jpg',
            tgl_expired: tgl_expired || null
        });
    }

    static async updateProduct(id, { nama, kategori, stock, harga, tgl_expired }, uploadedFilename = null) {
        await this.getProductById(id); // Ensure product exists

        const cleanNama = Sanitizer.cleanInput(nama);
        const numStock = parseInt(stock, 10);
        const numHarga = parseInt(harga, 10);

        if (!cleanNama || isNaN(numStock) || isNaN(numHarga)) {
            throw new Error('Nama produk, stok, dan harga wajib diisi secara valid.');
        }

        return await ProductRepo.updateProduct(id, {
            nama: cleanNama,
            kategori,
            stock: numStock,
            harga: numHarga,
            gambar: uploadedFilename, // null if no new file uploaded
            tgl_expired: tgl_expired || null
        });
    }

    static async deleteProduct(id) {
        await this.getProductById(id);
        return await ProductRepo.deleteProduct(id);
    }
}

module.exports = ProductService;
