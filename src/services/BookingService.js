const BookingRepo = require('../repositories/BookingRepo');
const Sanitizer = require('../utils/Sanitizer');

class BookingService {
    // ================= Pakets =================
    static async getAllPaket() {
        return await BookingRepo.getAllPaket();
    }

    static async createPaket({ nama_paket, jenis_hewan, harga, keterangan_grooming }) {
        const cleanNama = Sanitizer.cleanInput(nama_paket);
        const cleanKet = Sanitizer.cleanInput(keterangan_grooming);
        const numHarga = parseInt(harga, 10);

        if (!cleanNama || !cleanKet || isNaN(numHarga) || numHarga <= 0) {
            throw new Error('Nama paket, tarif harga, dan rincian perawatan grooming wajib diisi.');
        }

        if (jenis_hewan !== 'kucing' && jenis_hewan !== 'anjing') {
            throw new Error('Jenis hewan paket grooming harus kucing atau anjing.');
        }

        return await BookingRepo.createPaket({
            nama_paket: cleanNama,
            jenis_hewan,
            harga: numHarga,
            keterangan_grooming: cleanKet
        });
    }

    static async deletePaket(id_paket) {
        return await BookingRepo.deletePaket(id_paket);
    }

    // ================= Bookings =================
    static async getAllBookings() {
        return await BookingRepo.getAllBookings();
    }

    static async getCustomerBookings(id_customer) {
        return await BookingRepo.getBookingsByCustomer(id_customer);
    }

    static async createBooking({ id_paket, id_customer, tgl_booking, waktu }) {
        if (!id_paket || !id_customer || !tgl_booking || !waktu) {
            throw new Error('Pilihan paket, tanggal reservasi, dan jam booking wajib dipilih.');
        }

        const paket = await BookingRepo.findPaketById(id_paket);
        if (!paket) {
            throw new Error('Paket grooming yang dipilih tidak valid.');
        }

        return await BookingRepo.createBooking({
            id_paket,
            id_customer,
            tgl_booking,
            waktu
        });
    }

    static async updateBookingStatus(id_booking, status) {
        const validStatuses = ['menunggu konfirmasi', 'dikonfirmasi', 'selesai', 'dibatalkan'];
        if (!validStatuses.includes(status)) {
            throw new Error('Status booking tidak valid.');
        }

        return await BookingRepo.updateBookingStatus(id_booking, status);
    }

    static async cancelBookingByCustomer(id_booking, id_customer) {
        return await BookingRepo.cancelBookingByCustomer(id_booking, id_customer);
    }
}

module.exports = BookingService;
