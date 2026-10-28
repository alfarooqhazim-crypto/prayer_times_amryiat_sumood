// ============================================================
// app.js — نقطة الدخول الرئيسية (Init)
// ============================================================

import { initTheme } from './theme.js';
import { initFonts } from './fonts.js';
import { initDates } from './hijri.js';
import { startClockAndCountdown } from './clock.js';
import { buildMonthNavigation, renderTable } from './table.js';
import { renderUpcomingDays } from './upcoming.js';
import { renderPrayerTracker, initTrackerReset } from './tracker.js';
import { initNotifications } from './notifications.js';
import { initShareButtons } from './share.js';
import { initSearch } from './search.js';
import { initPWA } from './pwa.js';
import { showToast } from './utils.js';

// ============================================================
// Bootstrap
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Prayer Times App...');

    // 1. تعيين الشهر الحالي
    const now = new Date();
    const realMonth = now.getMonth() + 1;
    if (!localStorage.getItem('activeMonthId')) {
        localStorage.setItem('activeMonthId', realMonth);
    }

    // 2. التهيئة الأساسية
    initTheme();
    initFonts();
    initDates();

    // 3. بناء واجهة الجدول
    buildMonthNavigation();
    renderTable();
    renderUpcomingDays();

    // 4. بطاقة التتبع
    renderPrayerTracker();
    initTrackerReset();

    // 5. البحث والخيارات
    initSearch();

    // 6. الإشعارات
    initNotifications();

    // 7. أزرار المشاركة
    initShareButtons();

    // 8. بدء الساعة
    startClockAndCountdown();

    // 9. PWA
    initPWA();

    // 10. ربط دالة renderUpcomingDays عالمياً (للاستدعاء من table.js)
    window.__renderUpcomingDays = renderUpcomingDays;

    // 11. ترحيب
    setTimeout(() => showToast('أهلاً بك في تطبيق مواقيت الصلاة 🕌'), 500);

    console.log('✅ App ready!');
});