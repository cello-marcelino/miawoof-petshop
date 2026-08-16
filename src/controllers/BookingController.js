const BookingService = require('../services/BookingService');
const SessionManager = require('../utils/SessionManager');

class BookingController {
    // ================= Pakets Grooming =================
    static async handleGetPakets(req, res) {
        try {
            const pakets = await BookingService.getAllPaket();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: pakets }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleGetPaketById(req, res, id) {
        try {
            const paket = await BookingService.getPaketById(id);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: paket }));
        } catch (err) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleCreatePaket(req, res, body) {
        if (!SessionManager.requireAdmin(req, res, 'Akses khusus Admin.')) return;

        try {
            const result = await BookingService.createPaket(body);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Paket grooming berhasil ditambahkan!', data: result }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleUpdatePaket(req, res, id, body) {
        if (!SessionManager.requireAdmin(req, res, 'Akses khusus Admin.')) return;

        try {
            await BookingService.updatePaket(id, body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Paket grooming berhasil diperbarui.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleDeletePaket(req, res, id) {
        if (!SessionManager.requireAdmin(req, res, 'Akses khusus Admin.')) return;

        try {
            await BookingService.deletePaket(id);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Paket grooming berhasil dihapus.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    // ================= Customer Bookings =================
    static async handleGetBookings(req, res, queryParams) {
        const session = SessionManager.requireAuth(req, res);
        if (!session) return;

        try {
            let bookings;
            if (session.role === 'admin') {
                const filters = {
                    status: queryParams ? queryParams.get('status') : null,
                    search: queryParams ? queryParams.get('search') : null
                };
                bookings = await BookingService.getAllBookings(filters);
            } else {
                bookings = await BookingService.getCustomerBookings(session.userId);
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: bookings }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleCreateBooking(req, res, body) {
        const session = SessionManager.requireAuth(req, res, 'Silakan login terlebih dahulu untuk booking grooming.');
        if (!session) return;

        try {
            const booking = await BookingService.createBooking({
                id_paket: body.id_paket,
                id_customer: session.userId,
                nama_hewan: body.nama_hewan,
                jenis_hewan: body.jenis_hewan,
                tgl_booking: body.tgl_booking,
                waktu: body.waktu,
                catatan: body.catatan
            });

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Jadwal grooming berhasil dipesan!', data: booking }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleUpdateBookingStatus(req, res, id, body) {
        if (!SessionManager.requireAdmin(req, res, 'Akses ditolak: Hanya Admin.')) return;

        try {
            await BookingService.updateBookingStatus(id, body.status, body.catatan_admin);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Status booking grooming berhasil diperbarui.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleDeleteBooking(req, res, id) {
        const session = SessionManager.requireAuth(req, res);
        if (!session) return;

        try {
            const booking = await BookingService.getBookingById(id);
            if (session.role !== 'admin') {
                if (booking.id_customer !== session.userId) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, message: 'Akses ditolak.' }));
                }
                if (booking.status !== 'dibatalkan' && booking.status !== 'selesai') {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, message: 'Hanya riwayat yang dibatalkan atau selesai yang dapat dihapus.' }));
                }
            }

            await BookingService.deleteBooking(id);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Riwayat booking grooming berhasil dihapus.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleCancelBooking(req, res, id) {
        const session = SessionManager.requireAuth(req, res);
        if (!session) return;

        try {
            await BookingService.cancelBookingByCustomer(id, session.userId);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Booking grooming berhasil dibatalkan.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }
}

module.exports = BookingController;

