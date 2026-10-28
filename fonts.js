// ============================================================
// fonts.js — إدارة حجم الخط
// ============================================================

import { showToast } from './utils.js';

let fontScale = parseFloat(localStorage.getItem('prayer-font-scale') || '1');

/**
 * تطبيق حجم الخط على الصفحة
 */
export function applyFontScale() {
    document.documentElement.style.fontSize = `${fontScale * 16}px`;
}

/**
 * تهيئة أزرار حجم الخط
 */
export function initFonts() {
    applyFontScale();

    document.getElementById('fontIncBtn')?.addEventListener('click', () => {
        fontScale = Math.min(1.4, Math.round((fontScale + 0.1) * 10) / 10);
        applyFontScale();
        localStorage.setItem('prayer-font-scale', fontScale);
        showToast(`حجم الخط: ${Math.round(fontScale * 100)}%`);
    });

    document.getElementById('fontDecBtn')?.addEventListener('click', () => {
        fontScale = Math.max(0.8, Math.round((fontScale - 0.1) * 10) / 10);
        applyFontScale();
        localStorage.setItem('prayer-font-scale', fontScale);
        showToast(`حجم الخط: ${Math.round(fontScale * 100)}%`);
    });

    document.getElementById('fontResetBtn')?.addEventListener('click', () => {
        fontScale = 1;
        applyFontScale();
        localStorage.setItem('prayer-font-scale', 1);
        showToast('تمت إعادة حجم الخط للافتراضي');
    });
}