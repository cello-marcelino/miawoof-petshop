/**
 * Formatters & UI Utilities for MiaWoof Petshop
 */

// Format Rupiah Currency (e.g. 45000 -> Rp 45.000)
function formatRupiah(amount) {
    if (isNaN(amount)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Format Date to Indonesian localized format (e.g. 2026-08-16 -> 16 Agustus 2026)
function formatTanggalIndo(dateString) {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Floating Toast Alert Notification
function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '24px';
        toastContainer.style.right = '24px';
        toastContainer.style.zIndex = '99999';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-success text-white' : type === 'danger' ? 'bg-danger text-white' : 'bg-warning text-dark';
    
    toast.className = `toast align-items-center ${bgClass} border-0 show shadow-lg mb-2`;
    toast.role = 'alert';
    toast.ariaLive = 'assertive';
    toast.ariaAtomic = 'true';
    toast.style.borderRadius = '10px';
    toast.style.minWidth = '280px';
    
    toast.innerHTML = `
        <div class="d-flex p-3 align-items-center justify-content-between">
            <div class="fw-semibold">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 4000);
}

// Format Product & Asset Image URL helper
function formatProductImg(img) {
    if (!img) return '/images/placeholders/default_product.png';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) return img;
    return '/uploads/' + img;
}
