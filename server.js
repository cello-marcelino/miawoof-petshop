const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Controllers & Utils
const AuthController = require('./src/controllers/AuthController');
const ProductController = require('./src/controllers/ProductController');
const BookingController = require('./src/controllers/BookingController');
const OrderController = require('./src/controllers/OrderController');
const SlideController = require('./src/controllers/SlideController');
const UserController = require('./src/controllers/UserController');
const SessionManager = require('./src/utils/SessionManager');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const VIEWS_DIR = path.join(__dirname, 'src', 'views');

// MIME types for static file serving
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.jfif': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Helper to serve HTML views
function serveView(res, relativePath) {
    const filePath = path.join(VIEWS_DIR, relativePath);
    if (fs.existsSync(filePath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Halaman Tidak Ditemukan</h1>');
    }
}

// Helper to parse JSON request body
function parseJsonBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                resolve({});
            }
        });
    });
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();
    const queryParams = new URLSearchParams(parsedUrl.search);

    // ================= 1. Static Asset Serving =================
    if (pathname.startsWith('/css/') || pathname.startsWith('/js/') || pathname.startsWith('/images/') || pathname.startsWith('/uploads/')) {
        const filePath = path.join(PUBLIC_DIR, pathname);
        const ext = path.extname(filePath).toLowerCase();

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
            fs.createReadStream(filePath).pipe(res);
            return;
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Asset tidak ditemukan');
            return;
        }
    }

    // ================= 2. REST API Endpoints =================
    if (pathname.startsWith('/api/')) {
        // --- Auth APIs ---
        if (pathname === '/api/auth/login' && method === 'POST') {
            const body = await parseJsonBody(req);
            return AuthController.handleLogin(req, res, body);
        }
        if (pathname === '/api/auth/register' && method === 'POST') {
            const body = await parseJsonBody(req);
            return AuthController.handleRegister(req, res, body);
        }
        if (pathname === '/api/auth/logout' || pathname === '/logout') {
            return AuthController.handleLogout(req, res);
        }
        if (pathname === '/api/auth/session' && method === 'GET') {
            return AuthController.handleGetSession(req, res);
        }
        if (pathname === '/api/auth/profile' && method === 'POST') {
            const body = await parseJsonBody(req);
            return AuthController.handleUpdateProfile(req, res, body);
        }

        // --- Product APIs ---
        if (pathname === '/api/products' && method === 'GET') {
            return ProductController.handleGetProducts(req, res, queryParams);
        }
        if (pathname === '/api/products' && method === 'POST') {
            return ProductController.handleCreateProduct(req, res);
        }
        const productMatch = pathname.match(/^\/api\/products\/(\d+)$/);
        if (productMatch) {
            const id = productMatch[1];
            if (method === 'GET') return ProductController.handleGetProductById(req, res, id);
            if (method === 'POST' || method === 'PUT') return ProductController.handleUpdateProduct(req, res, id);
            if (method === 'DELETE') return ProductController.handleDeleteProduct(req, res, id);
        }

        // --- Slide / Banner CMS APIs ---
        if (pathname === '/api/slides' && method === 'GET') {
            return SlideController.handleGetSlides(req, res, queryParams);
        }
        if (pathname === '/api/slides' && method === 'POST') {
            const body = await parseJsonBody(req);
            return SlideController.handleCreateSlide(req, res, body);
        }
        const slideMatch = pathname.match(/^\/api\/slides\/(\d+)$/);
        if (slideMatch) {
            const id = slideMatch[1];
            if (method === 'GET') return SlideController.handleGetSlideById(req, res, id);
            if (method === 'POST' || method === 'PUT') {
                const body = await parseJsonBody(req);
                return SlideController.handleUpdateSlide(req, res, id, body);
            }
            if (method === 'DELETE') return SlideController.handleDeleteSlide(req, res, id);
        }
        const slideToggleMatch = pathname.match(/^\/api\/slides\/(\d+)\/toggle$/);
        if (slideToggleMatch && method === 'POST') {
            return SlideController.handleToggleActive(req, res, slideToggleMatch[1]);
        }

        // --- Paket Grooming APIs ---
        if (pathname === '/api/pakets' && method === 'GET') {
            return BookingController.handleGetPakets(req, res);
        }
        if (pathname === '/api/pakets' && method === 'POST') {
            const body = await parseJsonBody(req);
            return BookingController.handleCreatePaket(req, res, body);
        }
        const paketMatch = pathname.match(/^\/api\/pakets\/(\d+)$/);
        if (paketMatch) {
            const id = paketMatch[1];
            if (method === 'GET') return BookingController.handleGetPaketById(req, res, id);
            if (method === 'POST' || method === 'PUT') {
                const body = await parseJsonBody(req);
                return BookingController.handleUpdatePaket(req, res, id, body);
            }
            if (method === 'DELETE') return BookingController.handleDeletePaket(req, res, id);
        }

        // --- Booking Grooming APIs ---
        if (pathname === '/api/bookings' && method === 'GET') {
            return BookingController.handleGetBookings(req, res, queryParams);
        }
        if (pathname === '/api/bookings' && method === 'POST') {
            const body = await parseJsonBody(req);
            return BookingController.handleCreateBooking(req, res, body);
        }
        const bookingStatusMatch = pathname.match(/^\/api\/bookings\/(\d+)\/status$/);
        if (bookingStatusMatch && method === 'POST') {
            const body = await parseJsonBody(req);
            return BookingController.handleUpdateBookingStatus(req, res, bookingStatusMatch[1], body);
        }
        const bookingCancelMatch = pathname.match(/^\/api\/bookings\/(\d+)\/cancel$/);
        if (bookingCancelMatch && method === 'POST') {
            return BookingController.handleCancelBooking(req, res, bookingCancelMatch[1]);
        }
        const bookingDeleteMatch = pathname.match(/^\/api\/bookings\/(\d+)$/);
        if (bookingDeleteMatch && method === 'DELETE') {
            return BookingController.handleDeleteBooking(req, res, bookingDeleteMatch[1]);
        }

        // --- Order APIs (with Pickup/Delivery, Workflow & Complaints) ---
        if (pathname === '/api/orders' && method === 'GET') {
            return OrderController.handleGetOrders(req, res, queryParams);
        }
        if (pathname === '/api/orders' && method === 'POST') {
            const body = await parseJsonBody(req);
            return OrderController.handleCheckout(req, res, body);
        }
        const orderIdMatch = pathname.match(/^\/api\/orders\/(\d+)$/);
        if (orderIdMatch) {
            const id = orderIdMatch[1];
            if (method === 'GET') return OrderController.handleGetOrderById(req, res, id);
            if (method === 'DELETE') return OrderController.handleDeleteOrder(req, res, id);
        }
        const orderStatusMatch = pathname.match(/^\/api\/orders\/(\d+)\/status$/);
        if (orderStatusMatch && method === 'POST') {
            const body = await parseJsonBody(req);
            return OrderController.handleUpdateOrderStatus(req, res, orderStatusMatch[1], body);
        }
        const orderEditMatch = pathname.match(/^\/api\/orders\/(\d+)\/edit$/);
        if (orderEditMatch && method === 'POST') {
            const body = await parseJsonBody(req);
            return OrderController.handleEditOrder(req, res, orderEditMatch[1], body);
        }
        const orderConfirmReceivedMatch = pathname.match(/^\/api\/orders\/(\d+)\/confirm-received$/);
        if (orderConfirmReceivedMatch && method === 'POST') {
            return OrderController.handleConfirmReceived(req, res, orderConfirmReceivedMatch[1]);
        }
        const orderComplaintMatch = pathname.match(/^\/api\/orders\/(\d+)\/complaint$/);
        if (orderComplaintMatch && method === 'POST') {
            const body = await parseJsonBody(req);
            return OrderController.handleSubmitComplaint(req, res, orderComplaintMatch[1], body);
        }
        const orderRespondComplaintMatch = pathname.match(/^\/api\/orders\/(\d+)\/respond-complaint$/);
        if (orderRespondComplaintMatch && method === 'POST') {
            const body = await parseJsonBody(req);
            return OrderController.handleRespondComplaint(req, res, orderRespondComplaintMatch[1], body);
        }
        const orderCancelMatch = pathname.match(/^\/api\/orders\/(\d+)\/cancel$/);
        if (orderCancelMatch && method === 'POST') {
            return OrderController.handleCancelOrder(req, res, orderCancelMatch[1]);
        }

        // --- User & Admin APIs ---
        if (pathname === '/api/users' && method === 'GET') {
            return UserController.handleGetUsers(req, res);
        }
        const userMatch = pathname.match(/^\/api\/users\/(\d+)$/);
        if (userMatch && method === 'DELETE') {
            return UserController.handleDeleteUser(req, res, userMatch[1]);
        }
        if (pathname === '/api/admin/stats' && method === 'GET') {
            return UserController.handleGetDashboardStats(req, res);
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'API Endpoint tidak ditemukan.' }));
    }

    // ================= 3. Auth Direct Handlers =================
    if (pathname === '/logout') {
        return AuthController.handleLogout(req, res);
    }

    // ================= 4. HTML Views Routing & Guard =================
    const session = SessionManager.getSession(req);

    // Auth Views
    if (pathname === '/login') {
        if (session) {
            const dest = session.role === 'admin' ? '/admin/dashboard' : '/';
            res.writeHead(302, { 'Location': dest });
            return res.end();
        }
        return serveView(res, 'auth/login.html');
    }

    if (pathname === '/register') {
        if (session) {
            res.writeHead(302, { 'Location': '/' });
            return res.end();
        }
        return serveView(res, 'auth/register.html');
    }

    // Admin Views (Strict Admin Guard)
    if (pathname.startsWith('/admin')) {
        if (!session || session.role !== 'admin') {
            res.writeHead(302, { 'Location': '/login?msg=Akses+khusus+Admin.+Silakan+login&status=warning' });
            return res.end();
        }

        if (pathname === '/admin' || pathname === '/admin/dashboard') {
            return serveView(res, 'admin/dashboard.html');
        }
        if (pathname === '/admin/produk') {
            return serveView(res, 'admin/produk.html');
        }
        if (pathname === '/admin/pesanan') {
            return serveView(res, 'admin/pesanan.html');
        }
        if (pathname === '/admin/grooming') {
            return serveView(res, 'admin/grooming.html');
        }
        if (pathname === '/admin/sliders') {
            return serveView(res, 'admin/sliders.html');
        }
        if (pathname === '/admin/users') {
            return serveView(res, 'admin/users.html');
        }
        if (pathname === '/admin/profil') {
            return serveView(res, 'admin/profil.html');
        }
    }

    // Customer Views
    if (pathname === '/' || pathname === '/index.html') {
        return serveView(res, 'customer/home.html');
    }
    if (pathname === '/produk') {
        return serveView(res, 'customer/katalog.html');
    }
    if (pathname === '/grooming') {
        return serveView(res, 'customer/grooming.html');
    }

    // Customer Protected Views (Must be logged in)
    if (pathname === '/riwayat-pesanan' || pathname === '/riwayat-booking' || pathname === '/profil') {
        if (!session) {
            res.writeHead(302, { 'Location': '/login?msg=Silakan+masuk+terlebih+dahulu&status=warning' });
            return res.end();
        }

        if (pathname === '/riwayat-pesanan') return serveView(res, 'customer/history_pesanan.html');
        if (pathname === '/riwayat-booking') return serveView(res, 'customer/history_booking.html');
        if (pathname === '/profil') return serveView(res, 'customer/profil.html');
    }

    // Fallback 404 View
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<div style="text-align:center; padding: 4rem; font-family: sans-serif;"><h1>404 - Halaman Tidak Ditemukan</h1><p><a href="/">Kembali ke Beranda</a></p></div>');
});

server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🐾 MiaWoof Petshop Server Running on http://localhost:${PORT}`);
    console.log(`====================================================`);
});
