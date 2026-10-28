// ============================================================
// utils.js — دوال مساعدة
// ============================================================

import { PRAYER_DATA } from './data.js';

/**
 * تحويل نص وقت إلى كائن Date
 */
export function parseTimeToDate(timeStr, isPMHint = false) {
    const [hStr, mStr] = timeStr.split(':');
    let hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr, 10);
    if (isPMHint && hours < 12) hours += 12;
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
}

/**
 * عرض إشعار Toast
 */
export function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success'
        ? 'fa-check-circle text-emerald-400'
        : (type === 'info' ? 'fa-circle-info text-blue-400' : 'fa-exclamation-circle text-red-400');

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

/**
 * الحصول على بيانات شهر معين
 */
export function getMonthData(monthId) {
    return PRAYER_DATA.find(m => m.monthId === monthId);
}

/**
 * الحصول على مفتاح اليوم الحالي (YYYY-MM-DD)
 */
export function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/**
 * تنسيق الوقت بصيغة عربية
 */
export function formatTimeArabic(date) {
    return date.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
}