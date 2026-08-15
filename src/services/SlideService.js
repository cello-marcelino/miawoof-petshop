const SlideRepo = require('../repositories/SlideRepo');

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

    static async toggleActive(id) {
        await this.getSlideById(id);
        return await SlideRepo.toggleActive(id);
    }

    static async deleteSlide(id) {
        await this.getSlideById(id);
        return await SlideRepo.deleteSlide(id);
    }
}

module.exports = SlideService;
