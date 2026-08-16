const BookingRepo = require('../repositories/BookingRepo');
 
class BookingService {
    // ================= Pakets CRUD =================
    static async getAllPaket() {
        return await BookingRepo.getAllPaket();
    }

    static async getPaketById(id_paket) {
        const paket = await BookingRepo.findPaketById(id_paket);
        if (!paket) throw new Error('Paket grooming tidak ditemukan.');
        return paket;
    }

    static async createPaket({ nama_paket, jenis_hewan, harga, durasi_menit, keterangan_grooming, gambar }) {
        const cleanNama = (nama_paket || '').trim();
        const cleanKet = (keterangan_grooming || '').trim();
        const numHarga = parseInt(harga, 10);
        const numDurasi = parseInt(durasi_menit, 10) || 60;

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
            durasi_menit: numDurasi,
            keterangan_grooming: cleanKet,
            gambar: gambar || null
        });
    }

    static async updatePaket(id_paket, { nama_paket, jenis_hewan, harga, durasi_menit, keterangan_grooming, gambar }) {
        await this.getPaketById(id_paket);
        const cleanNama = (nama_paket || '').trim();
        const cleanKet = (keterangan_grooming || '').trim();
        const numHarga = parseInt(harga, 10);
        const numDurasi = parseInt(durasi_menit, 10) || 60;

        if (!cleanNama || !cleanKet || isNaN(numHarga) || numHarga <= 0) {
            throw new Error('Nama paket, tarif harga, dan rincian perawatan grooming wajib diisi.');
        }

        return await BookingRepo.updatePaket(id_paket, {
            nama_paket: cleanNama,
            jenis_hewan,
            harga: numHarga,
            durasi_menit: numDurasi,
            keterangan_grooming: cleanKet,
            gambar: gambar || null
        });
    }

    static async deletePaket(id_paket) {
        await this.getPaketById(id_paket);
        return await BookingRepo.deletePaket(id_paket);
    }

    // ================= Bookings =================
    static async getAllBookings(filters = {}) {
        return await BookingRepo.getAllBookings(filters);
    }

    static async getCustomerBookings(id_customer) {
        return await BookingRepo.getBookingsByCustomer(id_customer);
    }

    static async getBookingById(id_booking) {
        const booking = await BookingRepo.findBookingById(id_booking);
        if (!booking) throw new Error('Data booking grooming tidak ditemukan.');
        return booking;
    }

    static async createBooking({ id_paket, id_customer, nama_hewan, jenis_hewan, tgl_booking, waktu, catatan }) {
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
            nama_hewan: nama_hewan || 'Anabul',
            jenis_hewan: jenis_hewan || paket.jenis_hewan,
            tgl_booking,
            waktu,
            catatan: catatan || ''
        });
    }

    static async updateBookingStatus(id_booking, status, catatan_admin = null) {
        const validStatuses = ['menunggu_konfirmasi', 'dikonfirmasi', 'selesai', 'dibatalkan'];
        if (!validStatuses.includes(status)) {
            throw new Error('Status booking tidak valid.');
        }

        const existing = await this.getBookingById(id_booking);
        if (existing.status === 'dikonfirmasi' && status === 'dibatalkan') {
            throw new Error('Reservasi yang sudah dikonfirmasi tidak dapat dibatalkan.');
        }

        return await BookingRepo.updateBookingStatus(id_booking, status, catatan_admin);
    }

    static async deleteBooking(id_booking) {
        await this.getBookingById(id_booking);
        return await BookingRepo.deleteBooking(id_booking);
    }

    static async cancelBookingByCustomer(id_booking, id_customer) {
        const booking = await this.getBookingById(id_booking);
        if (booking.id_customer !== id_customer) {
            throw new Error('Anda tidak memiliki akses ke data reservasi ini.');
        }
        if (booking.status === 'dikonfirmasi' || booking.status === 'selesai' || booking.status === 'dibatalkan') {
            throw new Error('Reservasi yang sudah dikonfirmasi atau selesai tidak dapat dibatalkan.');
        }
        return await BookingRepo.cancelBookingByCustomer(id_booking, id_customer);
    }
}

module.exports = BookingService;
