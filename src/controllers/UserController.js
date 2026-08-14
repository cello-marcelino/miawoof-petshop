const UserRepo = require('../repositories/UserRepo');
const ProductRepo = require('../repositories/ProductRepo');
const OrderRepo = require('../repositories/OrderRepo');
const BookingRepo = require('../repositories/BookingRepo');
const SessionManager = require('../utils/SessionManager');

class UserController {
    static async handleGetUsers(req, res) {
        const session = SessionManager.getSession(req);
        if (!session || session.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Admin.' }));
        }

        try {
            const users = await UserRepo.getAllUsers();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: users }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleDeleteUser(req, res, id) {
        const session = SessionManager.getSession(req);
        if (!session || session.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Admin.' }));
        }

        try {
            await UserRepo.deleteUser(id);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Pengguna berhasil dihapus.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleGetDashboardStats(req, res) {
        const session = SessionManager.getSession(req);
        if (!session || session.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Admin.' }));
        }

        try {
            const [totalUsers, productStats, orderStats, bookingStats] = await Promise.all([
                UserRepo.countUsers(),
                ProductRepo.countProducts(),
                OrderRepo.countOrderStats(),
                BookingRepo.countBookings()
            ]);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: {
                    totalUsers,
                    totalProducts: productStats.total_produk,
                    totalStock: productStats.total_stok,
                    totalOrders: orderStats.total_pesanan,
                    totalRevenue: orderStats.total_pendapatan,
                    pendingOrders: orderStats.pending_pesanan,
                    totalBookings: bookingStats.total_booking,
                    pendingBookings: bookingStats.pending_booking
                }
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }
}

module.exports = UserController;
