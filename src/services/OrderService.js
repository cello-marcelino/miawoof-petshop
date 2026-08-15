const OrderRepo = require('../repositories/OrderRepo');
const ProductRepo = require('../repositories/ProductRepo');

class OrderService {
    static async getAllOrders(filters = {}) {
        return await OrderRepo.getAllOrders(filters);
    }

    static async getCustomerOrders(id_pembeli) {
        return await OrderRepo.getOrdersByCustomer(id_pembeli);
    }

    static async getOrderById(id_pesanan) {
        const order = await OrderRepo.findById(id_pesanan);
        if (!order) throw new Error('Pesanan tidak ditemukan.');
        return order;
    }

    static async checkoutOrder({ id_produk, id_pembeli, jumlah, metode_pengambilan, alamat_pengiriman, no_hp_penerima, catatan_pelanggan }) {
        const numJumlah = parseInt(jumlah, 10);
        if (!id_produk || !id_pembeli || isNaN(numJumlah) || numJumlah <= 0) {
            throw new Error('Jumlah pesanan tidak valid (minimal 1 unit).');
        }

        const product = await ProductRepo.findById(id_produk);
        if (!product) {
            throw new Error('Produk yang dipesan tidak ditemukan.');
        }

        if (product.stock < numJumlah) {
            throw new Error(`Maaf, stok produk "${product.nama}" tidak mencukupi. Sisa stok: ${product.stock} unit.`);
        }

        const metode = metode_pengambilan === 'diantar' ? 'diantar' : 'ambil_ditoko';
        if (metode === 'diantar' && (!alamat_pengiriman || alamat_pengiriman.trim() === '')) {
            throw new Error('Alamat pengiriman wajib diisi untuk metode pesanan diantar.');
        }

        const total = product.harga * numJumlah;

        return await OrderRepo.createOrderAtomic({
            id_produk,
            id_pembeli,
            jumlah: numJumlah,
            total,
            metode_pengambilan: metode,
            alamat_pengiriman: alamat_pengiriman || '',
            no_hp_penerima: no_hp_penerima || '',
            catatan_pelanggan: catatan_pelanggan || ''
        });
    }

    static async updateOrderStatus(id_pesanan, status, catatan_admin = null) {
        const validStatuses = [
            'menunggu_konfirmasi', 
            'dikonfirmasi', 
            'disiapkan_di_toko', 
            'dalam_pengantaran', 
            'selesai', 
            'dibatalkan', 
            'komplain'
        ];
        if (!validStatuses.includes(status)) {
            throw new Error('Status pesanan tidak valid.');
        }

        return await OrderRepo.updateOrderStatus(id_pesanan, status, catatan_admin);
    }

    static async updateOrderDetails(id_pesanan, data) {
        await this.getOrderById(id_pesanan);
        return await OrderRepo.updateOrderDetails(id_pesanan, data);
    }

    static async deleteOrder(id_pesanan) {
        await this.getOrderById(id_pesanan);
        return await OrderRepo.deleteOrder(id_pesanan);
    }

    static async confirmReceivedByCustomer(id_pesanan, id_pembeli) {
        const order = await this.getOrderById(id_pesanan);
        if (order.id_pembeli !== id_pembeli) {
            throw new Error('Anda tidak memiliki akses ke pesanan ini.');
        }
        return await OrderRepo.confirmReceivedByCustomer(id_pesanan, id_pembeli);
    }

    static async submitComplaint(id_pesanan, id_pembeli, komplain_text) {
        if (!komplain_text || komplain_text.trim() === '') {
            throw new Error('Deskripsi keluhan atau komplain wajib diisi.');
        }
        const order = await this.getOrderById(id_pesanan);
        if (order.id_pembeli !== id_pembeli) {
            throw new Error('Anda tidak memiliki akses ke pesanan ini.');
        }
        return await OrderRepo.submitComplaint(id_pesanan, id_pembeli, komplain_text);
    }

    static async respondComplaint(id_pesanan, komplain_tanggapan, newStatus = 'selesai') {
        if (!komplain_tanggapan || komplain_tanggapan.trim() === '') {
            throw new Error('Tanggapan komplain wajib diisi.');
        }
        await this.getOrderById(id_pesanan);
        return await OrderRepo.respondComplaint(id_pesanan, komplain_tanggapan, newStatus);
    }

    static async cancelOrderByCustomer(id_pesanan, id_pembeli) {
        return await OrderRepo.cancelOrderByCustomer(id_pesanan, id_pembeli);
    }
}

module.exports = OrderService;
