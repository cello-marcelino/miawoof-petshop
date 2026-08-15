const SlideRepo = require('../repositories/SlideRepo');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.resolve(__dirname, '../../public/uploads');

class SlideService {
    static async getAllSlides(onlyActive = false) {
        return await SlideRepo.getAllSlides(onlyActive);
    }

    static async getSlideById(id) {
        const slide = await SlideRepo.findById(id);
        if (!slide) throw new Error('Slide banner tidak ditemukan.');
        return slide;
    }

    static async createSlide(data) {
        if (!data.judul || !data.gambar) {
            throw new Error('Judul slide dan gambar banner wajib diisi.');
        }
        return await SlideRepo.createSlide(data);
    }

    static async updateSlide(id, data) {
        await this.getSlideById(id);
        if (!data.judul) throw new Error('Judul slide wajib diisi.');
        return await SlideRepo.updateSlide(id, data);
    }

    static async updateSlideWithUpload(id, fields, newFilename, delete_old_image = false) {
        const existingSlide = await this.getSlideById(id);
        if (!fields.judul) throw new Error('Judul slide wajib diisi.');

        if (newFilename) {
            const newImagePath = `/uploads/${newFilename}`;

            // If admin opted to delete old image from server
            if (delete_old_image && existingSlide.gambar && existingSlide.gambar.startsWith('/uploads/')) {
                const oldFilename = path.basename(existingSlide.gambar);
                const oldFilePath = path.join(UPLOADS_DIR, oldFilename);
                try {
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                } catch (unlinkErr) {
                    console.error('Failed to remove old slide image:', unlinkErr.message);
                }
            }

            fields.gambar = newImagePath;
        } else if (fields.existing_gambar_url) {
            fields.gambar = fields.existing_gambar_url;
        }

        return await SlideRepo.updateSlide(id, fields);
    }

    static async toggleActive(id) {
        await this.getSlideById(id);
        return await SlideRepo.toggleActive(id);
    }

    static async deleteSlide(id, delete_file = false) {
        const slide = await this.getSlideById(id);
        if (delete_file && slide.gambar && slide.gambar.startsWith('/uploads/')) {
            const filename = path.basename(slide.gambar);
            const filePath = path.join(UPLOADS_DIR, filename);
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (err) {}
        }
        return await SlideRepo.deleteSlide(id);
    }
}

module.exports = SlideService;
