const OrderService = require('../services/OrderService');
const SessionManager = require('../utils/SessionManager');

class OrderController {
    static async handleGetOrders(req, res) {
        const session = SessionManager.getSession(req);
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Silakan login terlebih dahulu.' }));
        }

        try {
            let orders;
            if (session.role === 'admin') {
                orders = await OrderService.getAllOrders();
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

    static async handleCheckout(req, res, body) {
        const session = SessionManager.getSession(req);
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Silakan login terlebih dahulu untuk checkout pesanan.' }));
        }

        try {
            const order = await OrderService.checkoutOrder({
                id_produk: body.id_produk,
                id_pembeli: session.userId,
                jumlah: body.jumlah
            });

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Pesanan berhasil dibuat!', data: order }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleUpdateOrderStatus(req, res, id, body) {
        const session = SessionManager.getSession(req);
        if (!session || session.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Admin.' }));
        }

        try {
            await OrderService.updateOrderStatus(id, body.status);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Status pesanan berhasil diperbarui.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleCancelOrder(req, res, id) {
        const session = SessionManager.getSession(req);
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Silakan login terlebih dahulu.' }));
        }

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
