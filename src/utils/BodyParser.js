const UploadHandler = require('./UploadHandler');

/**
 * Utility helper to parse JSON body from incoming HTTP request stream
 */
function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

/**
 * Unified request payload parser (transparently handles multipart form or JSON)
 */
async function parseRequestPayload(req) {
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
        const { fields, filename } = await UploadHandler.parseForm(req);
        return { fields, filename, isMultipart: true };
    }
    const fields = await parseJsonBody(req);
    return { fields, filename: null, isMultipart: false };
}

module.exports = { parseJsonBody, parseRequestPayload };
