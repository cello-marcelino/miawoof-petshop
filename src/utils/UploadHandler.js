const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOAD_DIR = path.resolve(__dirname, '../../public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

class UploadHandler {
    static async parseForm(req) {
        const form = new formidable.IncomingForm({
            uploadDir: UPLOAD_DIR,
            keepExtensions: true,
            maxFileSize: 2 * 1024 * 1024, // 2MB max
            allowEmptyFiles: false,
            filter: function ({ mimetype }) {
                // Whitelist only valid image types
                const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
                return validMimes.includes(mimetype);
            }
        });

        return new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    return reject(new Error('File upload gagal: Ukuran file melebihi 2MB atau format tidak didukung (harus JPG/PNG/WEBP).'));
                }

                // Standardize fields (convert array of 1 to string value if needed)
                const processedFields = {};
                for (const [key, val] of Object.entries(fields)) {
                    processedFields[key] = Array.isArray(val) ? val[0] : val;
                }

                let uploadedFileName = null;
                const fileObj = files.gambar || files.gambar_produk || files.receipt_file;

                if (fileObj) {
                    const actualFile = Array.isArray(fileObj) ? fileObj[0] : fileObj;
                    if (actualFile && actualFile.size > 0 && actualFile.filepath) {
                        const ext = path.extname(actualFile.originalFilename || '').toLowerCase() || '.jpg';
                        const newFilename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
                        const targetPath = path.join(UPLOAD_DIR, newFilename);

                        try {
                            fs.renameSync(actualFile.filepath, targetPath);
                            uploadedFileName = newFilename;
                        } catch (moveErr) {
                            return reject(new Error('Gagal memindahkan file yang diunggah.'));
                        }
                    }
                }

                resolve({ fields: processedFields, filename: uploadedFileName });
            });
        });
    }
}

module.exports = UploadHandler;
