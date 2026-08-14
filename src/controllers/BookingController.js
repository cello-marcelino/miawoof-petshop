const BookingService = require('../services/BookingService');
const SessionManager = require('../utils/SessionManager');

class BookingController {
    // ================= Pakets =================
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

    static async handleCreatePaket(req, res, body) {
        const session = SessionManager.getSession(req);
        if (!session || session.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Admin.' }));
        }

        try {
            const newPaket = await BookingService.createPaket(body);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Paket grooming berhasil dibuat!', data: newPaket }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleDeletePaket(req, res, id) {
        const session = SessionManager.getSession(req);
        if (!session || session.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Admin.' }));
        }

        try {
            await BookingService.deletePaket(id);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Paket grooming berhasil dihapus.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    // ================= Bookings =================
    static async handleGetBookings(req, res) {
        const session = SessionManager.getSession(req);
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Silakan login terlebih dahulu.' }));
        }

        try {
            let bookings;
            if (session.role === 'admin') {
                bookings = await BookingService.getAllBookings();
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
        const session = SessionManager.getSession(req);
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Silakan login terlebih dahulu untuk booking grooming.' }));
        }

        try {
            const booking = await BookingService.createBooking({
                id_paket: body.id_paket,
                id_customer: session.userId,
                tgl_booking: body.tgl_booking,
                waktu: body.waktu
            });

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Reservasi jadwal grooming berhasil diajukan!', data: booking }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleUpdateBookingStatus(req, res, id, body) {
        const session = SessionManager.getSession(req);
        if (!session || session.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Akses ditolak: Hanya Admin.' }));
        }

        try {
            await BookingService.updateBookingStatus(id, body.status);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Status booking berhasil diperbarui.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleCancelBooking(req, res, id) {
        const session = SessionManager.getSession(req);
        if (!session) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Silakan login terlebih dahulu.' }));
        }

        try {
            await BookingService.cancelBookingByCustomer(id, session.userId);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Booking berhasil dibatalkan.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }
}

module.exports = BookingController;
