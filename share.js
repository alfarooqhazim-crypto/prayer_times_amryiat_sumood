// ============================================================
// share.js — التصدير والمشاركة (CSV, Print, WhatsApp)
// ============================================================

import { getMonthData, showToast } from './utils.js';

/**
 * طباعة الجدول
 */
export function printTable() {
    window.print();
}

/**
 * تصدير الشهر الحالي إلى CSV
 */
export function exportCSV() {
    const activeId = parseInt(localStorage.getItem('activeMonthId') || (new Date().getMonth() + 1), 10);
    const monthData = getMonthData(activeId);
    if (!monthData) return;

    let csv = '\uFEFF'; // BOM للعربية
    csv += 'اليوم,الفجر,الشروق,الظهر,العصر,المغرب,العشاء\n';
    monthData.days.forEach(d => {
        csv += `${d.day},${d.fajr},${d.sunrise},${d.dhuhr},${d.asr},${d.maghrib},${d.isha}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `مواقيت_${monthData.nameAr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    showToast('تم تصدير الجدول بصيغة CSV');
}

/**
 * مشاركة مواقيت اليوم عبر WhatsApp أو Web Share API
 */
export async function shareToday() {
    const now = new Date();
    const m = now.getMonth() + 1;
    const day = now.getDate();
    const monthData = getMonthData(m);
    if (!monthData) return;

    const dayData = monthData.days.find(x => x.day === day);
    if (!dayData) return;

    const msg = `🕌 *مواقيت الصلاة - عامرية الصمود*
📅 ${day} ${monthData.nameAr} ${now.getFullYear()}
━━━━━━━━━━━━━━━
🌅 الفجر:    ${dayData.fajr}
🌄 الشروق:  ${dayData.sunrise}
☀️ الظهر:    ${dayData.dhuhr}
🌇 العصر:    ${dayData.asr}
🌆 المغرب:   ${dayData.maghrib}
🌃 العشاء:   ${dayData.isha}
━━━━━━━━━━━━━━━
🕋 تقبل الله منا ومنكم`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'مواقيت الصلاة',
                text: msg
            });
            showToast('تم فتح نافذة المشاركة');
        } catch (e) {
            // المستخدم ألغى المشاركة
            if (e.name !== 'AbortError') {
                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
            }
        }
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
        showToast('جاري فتح WhatsApp');
    }
}

/**
 * تهيئة أزرار المشاركة والتصدير
 */
export function initShareButtons() {
    document.getElementById('printBtn')?.addEventListener('click', printTable);
    document.getElementById('csvBtn')?.addEventListener('click', exportCSV);
    document.getElementById('shareBtn')?.addEventListener('click', shareToday);
}