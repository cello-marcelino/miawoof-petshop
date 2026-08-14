const OrderRepo = require('../repositories/OrderRepo');
const ProductRepo = require('../repositories/ProductRepo');

class OrderService {
    static async getAllOrders() {
        return await OrderRepo.getAllOrders();
    }

    static async getCustomerOrders(id_pembeli) {
        return await OrderRepo.getOrdersByCustomer(id_pembeli);
    }

    static async checkoutOrder({ id_produk, id_pembeli, jumlah }) {
        const numJumlah = parseInt(jumlah, 10);
        if (!id_produk || !id_pembeli || isNaN(numJumlah) || numJumlah <= 0) {
            throw new Error('Jumlah pesanan tidak valid (minimal 1 unit).');
        }

        const product = await ProductRepo.findById(id_produk);
        if (!product) {
            throw new Error('Produk yang dipesan tidak ditemukan.');
        }

        if (product.stock < numJumlah) {
            throw new Error(`Maaf, stok produk tidak mencukupi. Sisa stok saat ini: ${product.stock} unit.`);
        }

        const total = product.harga * numJumlah;

        // Perform atomic checkout & stock deduction
        return await OrderRepo.createOrderAtomic(id_produk, id_pembeli, numJumlah, total);
    }

    static async updateOrderStatus(id_pesanan, status) {
        const validStatuses = ['menunggu pembayaran', 'diproses', 'selesai', 'dibatalkan'];
        if (!validStatuses.includes(status)) {
            throw new Error('Status pesanan tidak valid.');
        }

        return await OrderRepo.updateOrderStatus(id_pesanan, status);
    }

    static async cancelOrderByCustomer(id_pesanan, id_pembeli) {
        return await OrderRepo.cancelOrderByCustomer(id_pesanan, id_pembeli);
    }
}

module.exports = OrderService;
