const OrderService = require('../services/OrderService');
const SessionManager = require('../utils/SessionManager');

class OrderController {
    static async handleGetOrders(req, res, queryParams) {
        const session = SessionManager.requireAuth(req, res);
        if (!session) return;

        try {
            let orders;
            if (session.role === 'admin') {
                const filters = {
                    status: queryParams ? queryParams.get('status') : null,
                    metode: queryParams ? queryParams.get('metode') : null,
                    search: queryParams ? queryParams.get('search') : null
                };
                orders = await OrderService.getAllOrders(filters);
            } else {
                orders = await OrderService.getCustomerOrders(session.userId);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: orders }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleGetOrderById(req, res, id) {
        const session = SessionManager.requireAuth(req, res);
        if (!session) return;

        try {
            const order = await OrderService.getOrderById(id);
            if (session.role !== 'admin' && order.id_pembeli !== session.userId) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Akses ditolak.' }));
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: order }));
        } catch (err) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleCheckout(req, res, body) {
        const session = SessionManager.requireAuth(req, res, 'Silakan login terlebih dahulu untuk checkout pesanan.');
        if (!session) return;

        try {
            const order = await OrderService.checkoutOrder({
                id_produk: body.id_produk,
                id_pembeli: session.userId,
                jumlah: body.jumlah,
                metode_pengambilan: body.metode_pengambilan,
                alamat_pengiriman: body.alamat_pengiriman,
                no_hp_penerima: body.no_hp_penerima,
                catatan_pelanggan: body.catatan_pelanggan
            });

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Pesanan berhasil dibuat!', data: order }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleUpdateOrderStatus(req, res, id, body) {
        if (!SessionManager.requireAdmin(req, res, 'Akses ditolak: Hanya Admin.')) return;

        try {
            await OrderService.updateOrderStatus(id, body.status, body.catatan_admin);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Status pesanan berhasil diperbarui.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleEditOrder(req, res, id, body) {
        if (!SessionManager.requireAdmin(req, res, 'Akses ditolak: Hanya Admin.')) return;

        try {
            await OrderService.updateOrderDetails(id, body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Data pesanan berhasil diperbarui.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleDeleteOrder(req, res, id) {
        if (!SessionManager.requireAdmin(req, res, 'Akses ditolak: Hanya Admin.')) return;

        try {
            await OrderService.deleteOrder(id);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Pesanan berhasil dihapus dan stok telah disesuaikan.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleConfirmReceived(req, res, id) {
        const session = SessionManager.requireAuth(req, res);
        if (!session) return;

        try {
            await OrderService.confirmReceivedByCustomer(id, session.userId);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Terima kasih! Pesanan telah Anda konfirmasi diterima.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleSubmitComplaint(req, res, id, body) {
        const session = SessionManager.requireAuth(req, res);
        if (!session) return;

        try {
            await OrderService.submitComplaint(id, session.userId, body.komplain_text);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Komplain pesanan berhasil diajukan. Tim admin kami akan segera menindaklanjuti.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleRespondComplaint(req, res, id, body) {
        if (!SessionManager.requireAdmin(req, res, 'Akses khusus Admin.')) return;

        try {
            await OrderService.respondComplaint(id, body.komplain_tanggapan, body.status || 'selesai');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Tanggapan komplain berhasil dikirim ke pelanggan.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleCancelOrder(req, res, id) {
        const session = SessionManager.requireAuth(req, res);
        if (!session) return;

        try {
            await OrderService.cancelOrderByCustomer(id, session.userId);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Pesanan berhasil dibatalkan dan stok produk telah dikembalikan.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }
}

module.exports = OrderController;

