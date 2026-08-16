/**
 * Comprehensive Automated Test Suite for Booking Grooming Feature (MiaWoof Petshop)
 */

const http = require('http');
const AuthService = require('./src/services/AuthService');
const BookingService = require('./src/services/BookingService');
const BookingRepo = require('./src/repositories/BookingRepo');
const UserRepo = require('./src/repositories/UserRepo');

async function runTests() {
    console.log('\n======================================================');
    console.log('🐾 [TEST SUITE] FITUR BOOKING & GROOMING MIAWOOF PETSHOP');
    console.log('======================================================\n');

    let passedTests = 0;
    let totalTests = 0;

    function assert(condition, message) {
        totalTests++;
        if (condition) {
            console.log(`  ✅ PASS: ${message}`);
            passedTests++;
        } else {
            console.error(`  ❌ FAIL: ${message}`);
        }
    }

    try {
        // ----------------------------------------------------
        // TEST 1: Memuat Daftar Paket Grooming
        // ----------------------------------------------------
        console.log('📋 [TEST GROUP 1] Master Data Paket Grooming:');
        const pakets = await BookingService.getAllPaket();
        assert(Array.isArray(pakets) && pakets.length >= 4, 'Mengambil seluruh daftar paket grooming (minimal 4 paket default).');
        
        const firstPaket = pakets[0];
        assert(firstPaket && firstPaket.nama_paket && firstPaket.harga > 0, `Paket "${firstPaket.nama_paket}" memiliki harga valid (${firstPaket.harga}).`);

        const singlePaket = await BookingService.getPaketById(firstPaket.id_paket);
        assert(singlePaket && singlePaket.id_paket === firstPaket.id_paket, `Mencari paket spesifik berdasarkan ID (${firstPaket.id_paket}).`);

        // ----------------------------------------------------
        // TEST 2: Validasi Autentikasi Pengguna untuk Booking
        // ----------------------------------------------------
        console.log('\n🔐 [TEST GROUP 2] Autentikasi Customer & Admin:');
        const customer = await AuthService.login({ username: 'budi_santoso', password: 'customer123' });
        assert(customer && customer.role === 'customer', `Login Customer "${customer.username}" berhasil (ID: ${customer.id}).`);

        const admin = await AuthService.login({ username: 'admin', password: 'admin123' });
        assert(admin && admin.role === 'admin', `Login Admin "${admin.username}" berhasil.`);

        // ----------------------------------------------------
        // TEST 3: Pembuatan Booking Baru oleh Customer
        // ----------------------------------------------------
        console.log('\n📅 [TEST GROUP 3] Reservasi Grooming oleh Customer:');
        const newBookingPayload = {
            id_paket: firstPaket.id_paket,
            id_customer: customer.id,
            nama_hewan: 'Mochi si Kucing Persia',
            jenis_hewan: 'kucing',
            tgl_booking: '2026-08-20',
            waktu: '14:00',
            catatan: 'Tolong potong kuku agak pendek dan shampoo anti kutu.'
        };

        const createResult = await BookingService.createBooking(newBookingPayload);
        assert(createResult && createResult.id_booking > 0, `Customer berhasil membuat reservasi grooming baru (ID Booking: ${createResult.id_booking}).`);
        const createdBookingId = createResult.id_booking;

        // Verify in customer history
        const customerBookings = await BookingService.getCustomerBookings(customer.id);
        const foundInHistory = customerBookings.find(b => b.id_booking === createdBookingId);
        assert(!!foundInHistory, 'Jadwal reservasi baru langsung muncul di riwayat booking customer.');
        assert(foundInHistory && foundInHistory.status === 'menunggu_konfirmasi', 'Status awal booking adalah "menunggu_konfirmasi".');
        assert(foundInHistory && foundInHistory.nama_hewan === 'Mochi si Kucing Persia', 'Data anabul "Mochi si Kucing Persia" tersimpan akurat.');

        // ----------------------------------------------------
        // TEST 4: Validasi Input Booking Tidak Lengkap
        // ----------------------------------------------------
        console.log('\n⚠️ [TEST GROUP 4] Validasi Error Input Booking:');
        let validationErrorOccurred = false;
        try {
            await BookingService.createBooking({
                id_paket: null, // missing paket
                id_customer: customer.id,
                tgl_booking: '',
                waktu: ''
            });
        } catch (err) {
            validationErrorOccurred = true;
        }
        assert(validationErrorOccurred, 'Sistem menolak reservasi jika paket/tanggal/jam belum diisi.');

        // ----------------------------------------------------
        // TEST 5: Admin Memantau & Konfirmasi Booking
        // ----------------------------------------------------
        console.log('\n⚡ [TEST GROUP 5] Manajemen Status oleh Admin:');
        const allAdminBookings = await BookingService.getAllBookings();
        const foundAdminBooking = allAdminBookings.find(b => b.id_booking === createdBookingId);
        assert(!!foundAdminBooking, 'Admin dapat melihat reservasi baru di Panel Admin.');

        // Update status to 'dikonfirmasi'
        await BookingService.updateBookingStatus(createdBookingId, 'dikonfirmasi', 'Jadwal disetujui, ruangan & staf siap.');
        const updatedBooking = await BookingService.getBookingById(createdBookingId);
        assert(updatedBooking.status === 'dikonfirmasi', 'Admin berhasil mengubah status booking menjadi "dikonfirmasi".');
        assert(updatedBooking.catatan_admin === 'Jadwal disetujui, ruangan & staf siap.', 'Catatan admin berhasil disimpan.');

        // Update status to 'selesai'
        await BookingService.updateBookingStatus(createdBookingId, 'selesai', 'Perawatan grooming selesai dengan baik.');
        const finishedBooking = await BookingService.getBookingById(createdBookingId);
        assert(finishedBooking.status === 'selesai', 'Status booking berhasil diubah menjadi "selesai".');

        // ----------------------------------------------------
        // TEST 6: Pembatalan Reservasi Pending oleh Customer
        // ----------------------------------------------------
        console.log('\n❌ [TEST GROUP 6] Pembatalan Reservasi Pending:');
        const secondBooking = await BookingService.createBooking({
            id_paket: firstPaket.id_paket,
            id_customer: customer.id,
            nama_hewan: 'Oreo si Kucing Domestik',
            jenis_hewan: 'kucing',
            tgl_booking: '2026-08-22',
            waktu: '11:00',
            catatan: 'Testing cancel pending'
        });

        await BookingService.cancelBookingByCustomer(secondBooking.id_booking, customer.id);
        const cancelledBooking = await BookingService.getBookingById(secondBooking.id_booking);
        assert(cancelledBooking.status === 'dibatalkan', 'Customer berhasil membatalkan reservasi berstatus pending.');

        // ----------------------------------------------------
        // TEST 7: Pembatalan Reservasi yang SUDAH DIKONFIRMASI
        // ----------------------------------------------------
        console.log('\n🚫 [TEST GROUP 7] Pembatalan Reservasi yang SUDAH DIKONFIRMASI:');
        
        // 7A. Customer membatalkan reservasi yang sudah dikonfirmasi
        const confirmedBooking1 = await BookingService.createBooking({
            id_paket: firstPaket.id_paket,
            id_customer: customer.id,
            nama_hewan: 'Milo si Beagle',
            jenis_hewan: 'anjing',
            tgl_booking: '2026-08-25',
            waktu: '09:00',
            catatan: 'Testing cancel confirmed by customer'
        });
        await BookingService.updateBookingStatus(confirmedBooking1.id_booking, 'dikonfirmasi', 'Jadwal telah disetujui');
        
        // Customer membatalkan booking yang berstatus dikonfirmasi
        await BookingService.cancelBookingByCustomer(confirmedBooking1.id_booking, customer.id);
        const customerCancelledResult = await BookingService.getBookingById(confirmedBooking1.id_booking);
        assert(customerCancelledResult.status === 'dibatalkan', 'Customer berhasil membatalkan reservasi yang sebelumnya berstatus "dikonfirmasi".');

        // 7B. Admin membatalkan reservasi yang sudah dikonfirmasi (beserta alasan/catatan)
        const confirmedBooking2 = await BookingService.createBooking({
            id_paket: firstPaket.id_paket,
            id_customer: customer.id,
            nama_hewan: 'Choco si Poodle',
            jenis_hewan: 'anjing',
            tgl_booking: '2026-08-26',
            waktu: '15:30',
            catatan: 'Testing cancel confirmed by admin'
        });
        await BookingService.updateBookingStatus(confirmedBooking2.id_booking, 'dikonfirmasi', 'Jadwal telah disetujui');
        
        // Admin membatalkan reservasi terkonfirmasi
        await BookingService.updateBookingStatus(confirmedBooking2.id_booking, 'dibatalkan', 'Dibatalkan admin: Groomer spesialis anjing sedang berhalangan hadir.');
        const adminCancelledResult = await BookingService.getBookingById(confirmedBooking2.id_booking);
        assert(adminCancelledResult.status === 'dibatalkan', 'Admin berhasil membatalkan reservasi yang berstatus "dikonfirmasi".');
        assert(adminCancelledResult.catatan_admin.includes('Groomer spesialis'), 'Alasan pembatalan oleh admin tersimpan dengan benar.');

        // 7C. Guard: Reservasi yang SUDAH SELESAI tidak boleh dibatalkan
        let completedCancelError = false;
        try {
            // createdBookingId was marked as 'selesai' in TEST 5
            await BookingService.cancelBookingByCustomer(createdBookingId, customer.id);
        } catch (err) {
            completedCancelError = true;
        }
        assert(completedCancelError, 'Sistem menolak pembatalan pada reservasi yang statusnya sudah "selesai".');

        // 7D. Guard: Customer lain dilarang membatalkan booking yang bukan miliknya
        const otherCustomer = await AuthService.login({ username: 'siti_aminah', password: 'customer123' });
        let unauthorizedCancelError = false;
        try {
            await BookingService.cancelBookingByCustomer(confirmedBooking2.id_booking, otherCustomer.id);
        } catch (err) {
            unauthorizedCancelError = true;
        }
        assert(unauthorizedCancelError, 'Sistem menolak pembatalan jika dilakukan oleh customer lain (bukan pemilik booking).');

        // ----------------------------------------------------
        // TEST 8: Penghapusan Data Booking oleh Admin
        // ----------------------------------------------------
        console.log('\n🗑️ [TEST GROUP 8] Penghapusan Reservasi oleh Admin:');
        await BookingService.deleteBooking(secondBooking.id_booking);
        const checkDeleted = await BookingRepo.findBookingById(secondBooking.id_booking);
        assert(checkDeleted === null || checkDeleted === undefined, 'Admin berhasil menghapus data booking yang dibatalkan.');

        // ----------------------------------------------------
        // TEST 9: Statistik Dashboard Grooming
        // ----------------------------------------------------
        console.log('\n📊 [TEST GROUP 9] Penghitungan Statistik Booking:');
        const stats = await BookingRepo.countBookings();
        assert(stats && typeof stats.total_booking === 'number', `Statistik booking terhitung: Total ${stats.total_booking}, Pending ${stats.pending_booking}, Dikonfirmasi ${stats.confirmed_booking}.`);

        // ----------------------------------------------------
        // HASIL RINGKASAN
        // ----------------------------------------------------
        console.log('\n======================================================');
        console.log(`🎉 HASIL TESTING: ${passedTests}/${totalTests} UJI COBA BERHASIL (${Math.round((passedTests / totalTests) * 100)}%)`);
        console.log('======================================================\n');
        process.exit(0);

    } catch (err) {
        console.error('❌ Terjadi error fatal selama pengujian:', err);
        process.exit(1);
    }
}

runTests();
