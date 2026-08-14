class Sanitizer {
    static escapeHtml(str) {
        if (!str || typeof str !== 'string') return str;
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    static cleanInput(str) {
        if (!str || typeof str !== 'string') return '';
        return str.trim();
    }
}

module.exports = Sanitizer;
