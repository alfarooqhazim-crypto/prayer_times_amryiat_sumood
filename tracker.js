// ============================================================
// tracker.js — تتبع الصلوات الخمس اليومية
// ============================================================

import { showToast, getTodayKey } from './utils.js';

const PRAYER_NAMES = ['الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء'];

/**
 * عرض بطاقة التتبع
 */
export function renderPrayerTracker() {
    const grid = document.getElementById('trackerGrid');
    if (!grid) return;

    const todayKey = getTodayKey();
    const all = JSON.parse(localStorage.getItem('prayer-tracker') || '{}');
    const todayDone = all[todayKey] || [];

    grid.innerHTML = PRAYER_NAMES.map(p => {
        const isDone = todayDone.includes(p);
        return `<button data-prayer="${p}" class="tracker-btn py-2.5 px-1 rounded-lg text-xs font-bold border transition ${
            isDone
                ? 'done bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-emerald-500 hover:text-emerald-400'
        }">${isDone ? '<i class="fa-solid fa-check ml-1"></i>' : ''}${p}</button>`;
    }).join('');

    // تحديث شريط التقدم
    const progress = todayDone.length;
    setTextIfExists('trackerProgress', `${progress}/5`);
    const progressBar = document.getElementById('trackerProgressBar');
    if (progressBar) progressBar.style.width = `${(progress / 5) * 100}%`;

    // تحديث التاريخ
    const dateLabel = new Date().toLocaleDateString('ar-IQ', {
        weekday: 'long', day: 'numeric', month: 'long'
    });
    setTextIfExists('trackerDateLabel', `- ${dateLabel}`);

    // ربط الأزرار
    grid.querySelectorAll('.tracker-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const p = btn.dataset.prayer;
            const all = JSON.parse(localStorage.getItem('prayer-tracker') || '{}');
            all[todayKey] = all[todayKey] || [];
            const idx = all[todayKey].indexOf(p);
            if (idx >= 0) {
                all[todayKey].splice(idx, 1);
            } else {
                all[todayKey].push(p);
                showToast(`تم تسجيل صلاة ${p} ✓`);
            }
            localStorage.setItem('prayer-tracker', JSON.stringify(all));
            renderPrayerTracker();
        });
    });
}

/**
 * إعادة تعيين تتبع اليوم
 */
export function resetTodayTracker() {
    const todayKey = getTodayKey();
    const all = JSON.parse(localStorage.getItem('prayer-tracker') || '{}');
    delete all[todayKey];
    localStorage.setItem('prayer-tracker', JSON.stringify(all));
    renderPrayerTracker();
    showToast('تمت إعادة تعيين تتبع اليوم');
}

/**
 * تهيئة زر إعادة التعيين
 */
export function initTrackerReset() {
    document.getElementById('resetTrackerBtn')?.addEventListener('click', resetTodayTracker);
}

function setTextIfExists(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}