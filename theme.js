// ============================================================
// theme.js — إدارة الوضع الفاتح/الداكن
// ============================================================

import { showToast } from './utils.js';

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

/**
 * تطبيق الثيم على الصفحة
 */
export function applyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'light') {
        html.classList.remove('dark');
        if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) metaTheme.setAttribute('content', '#059669');
    } else {
        html.classList.add('dark');
        if (themeIcon) themeIcon.className = 'fa-solid fa-moon';
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) metaTheme.setAttribute('content', '#10b981');
    }
    localStorage.setItem('prayer-theme', theme);
}

/**
 * تهيئة زر تبديل الثيم
 */
export function initTheme() {
    // تطبيق الثيم المحفوظ
    const savedTheme = localStorage.getItem('prayer-theme') || 'dark';
    applyTheme(savedTheme);

    // ربط الزر
    themeToggle?.addEventListener('click', () => {
        const current = localStorage.getItem('prayer-theme') || 'dark';
        applyTheme(current === 'dark' ? 'light' : 'dark');
        showToast(current === 'dark' ? 'تم تفعيل الوضع الفاتح' : 'تم تفعيل الوضع الداكن');
    });
}