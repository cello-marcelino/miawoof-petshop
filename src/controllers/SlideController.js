const SlideService = require('../services/SlideService');
const SessionManager = require('../utils/SessionManager');
const UploadHandler = require('../utils/UploadHandler');

class SlideController {
    static async handleGetSlides(req, res, queryParams) {
        try {
            const onlyActive = queryParams ? queryParams.get('active') === 'true' : false;
            const slides = await SlideService.getAllSlides(onlyActive);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: slides }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleGetSlideById(req, res, id) {
        try {
            const slide = await SlideService.getSlideById(id);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: slide }));
        } catch (err) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleCreateSlide(req, res) {
        const session = SessionManager.getSession(req);
        if (!session || session.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Akses khusus Admin.' }));
        }

        try {
            const contentType = req.headers['content-type'] || '';
            let payload = {};

            if (contentType.includes('multipart/form-data')) {
                const { fields, filename } = await UploadHandler.parseForm(req);
                payload = { ...fields };
                if (filename) {
                    payload.gambar = `/uploads/${filename}`;
                } else if (fields.existing_gambar_url) {
                    payload.gambar = fields.existing_gambar_url;
                }
            } else {
                let body = '';
                for await (const chunk of req) body += chunk;
                payload = body ? JSON.parse(body) : {};
            }

            if (!payload.gambar) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'File gambar banner wajib diunggah atau dipilih dari galeri.' }));
            }

            const result = await SlideService.createSlide(payload);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Slide promosi berhasil ditambahkan.', data: result }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleUpdateSlide(req, res, id) {
        const session = SessionManager.getSession(req);
        if (!session || session.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Akses khusus Admin.' }));
        }

        try {
            const contentType = req.headers['content-type'] || '';
            let fields = {};
            let filename = null;
            let delete_old_image = false;

            if (contentType.includes('multipart/form-data')) {
                const parsed = await UploadHandler.parseForm(req);
                fields = parsed.fields;
                filename = parsed.filename;
                delete_old_image = fields.delete_old_image === 'true' || fields.delete_old_image === '1';
            } else {
                let body = '';
                for await (const chunk of req) body += chunk;
                fields = body ? JSON.parse(body) : {};
                delete_old_image = fields.delete_old_image === true;
            }

            await SlideService.updateSlideWithUpload(id, fields, filename, delete_old_image);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Slide promosi berhasil diperbarui.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleToggleActive(req, res, id) {
        const session = SessionManager.getSession(req);
        if (!session || session.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Akses khusus Admin.' }));
        }

        try {
            await SlideService.toggleActive(id);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Status slide berhasil diubah.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }

    static async handleDeleteSlide(req, res, id, queryParams) {
        const session = SessionManager.getSession(req);
        if (!session || session.role !== 'admin') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, message: 'Akses khusus Admin.' }));
        }

        try {
            const deleteFile = queryParams ? queryParams.get('delete_file') === 'true' : false;
            await SlideService.deleteSlide(id, deleteFile);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Slide promosi berhasil dihapus.' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
    }
}

module.exports = SlideController;
