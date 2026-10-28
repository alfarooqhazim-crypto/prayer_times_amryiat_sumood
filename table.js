// ============================================================
// table.js — الجدول الشهري والتنقل بين الأشهر
// ============================================================

import { PRAYER_DATA } from './data.js';
import { getMonthData } from './utils.js';
import { setActiveMonth, updateCountdownAndSummary } from './clock.js';

// حالة البحث
export let searchedDayNumber = null;

/**
 * بناء أزرار التنقل بين الأشهر
 */
export function buildMonthNavigation() {
    const container = document.getElementById('monthTabsContainer');
    const dropdown = document.getElementById('monthSelectDropdown');
    if (!container || !dropdown) return;

    container.innerHTML = '';
    dropdown.innerHTML = '';

    const currentMonth = new Date().getMonth() + 1;
    const activeId = getCurrentActiveMonthId();

    PRAYER_DATA.forEach(month => {
        // زر Desktop
        const btn = document.createElement('button');
        btn.className = `px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition flex items-center gap-2 ${
            month.monthId === activeId
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`;
        btn.innerHTML = `<span class="opacity-75">${month.monthId}.</span> ${month.nameAr}`;
        btn.addEventListener('click', () => switchMonth(month.monthId));
        container.appendChild(btn);

        // خيار Mobile
        const opt = document.createElement('option');
        opt.value = month.monthId;
        opt.textContent = `${month.monthId}. ${month.nameAr}`;
        if (month.monthId === activeId) opt.selected = true;
        dropdown.appendChild(opt);
    });

    dropdown.onchange = (e) => switchMonth(parseInt(e.target.value, 10));
}

/**
 * تبديل الشهر
 */
export function switchMonth(monthId) {
    setActiveMonth(monthId);
    buildMonthNavigation();
    renderTable();
    updateCountdownAndSummary();
    // استدعاء renderUpcomingDays سيُدار من app.js
    if (window.__renderUpcomingDays) window.__renderUpcomingDays();
}

/**
 * الحصول على الشهر النشط
 */
function getCurrentActiveMonthId() {
    // نقرأ من clock.js (المرجع المشترك)
    const realMonth = new Date().getMonth() + 1;
    // نحاول قراءة من localStorage إن وُجد
    const stored = localStorage.getItem('activeMonthId');
    return stored ? parseInt(stored, 10) : realMonth;
}

/**
 * عرض الجدول
 */
export function renderTable() {
    const activeId = parseInt(localStorage.getItem('activeMonthId') || (new Date().getMonth() + 1), 10);
    const monthData = getMonthData(activeId);
    if (!monthData) return;

    setTextIfExists('tableHeading', `جدول ${monthData.label}`);
    setTextIfExists('currentSelectedMonthLabel', monthData.label);
    setTextIfExists('monthMetaTag', `${monthData.daysCount} يوماً`);
    setTextIfExists('printMonthTitle', monthData.label);

    const tbody = document.getElementById('prayerTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const today = new Date();
    const isCurrentMonthReal = (today.getMonth() + 1) === activeId;
    const currentRealDay = today.getDate();

    monthData.days.forEach(row => {
        if (searchedDayNumber && row.day !== searchedDayNumber) return;

        const isTodayRow = isCurrentMonthReal && (row.day === currentRealDay);
        const tr = document.createElement('tr');
        tr.className = `transition hover:bg-slate-800/50 ${isTodayRow ? 'today-row' : 'text-slate-300'}`;

        tr.innerHTML = `
            <td class="py-3 md:py-3.5 px-2 md:px-4 text-center font-bold ${isTodayRow ? 'text-emerald-400' : 'text-amber-400'}">
                ${row.day}
                ${isTodayRow ? '<span class="inline-block text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-extrabold mr-1">اليوم</span>' : ''}
            </td>
            <td class="py-3 md:py-3.5 px-2 md:px-4 text-center font-mono">${row.fajr}</td>
            <td class="py-3 md:py-3.5 px-2 md:px-4 text-center font-mono text-slate-400">${row.sunrise}</td>
            <td class="py-3 md:py-3.5 px-2 md:px-4 text-center font-mono">${row.dhuhr}</td>
            <td class="py-3 md:py-3.5 px-2 md:px-4 text-center font-mono">${row.asr}</td>
            <td class="py-3 md:py-3.5 px-2 md:px-4 text-center font-mono">${row.maghrib}</td>
            <td class="py-3 md:py-3.5 px-2 md:px-4 text-center font-mono">${row.isha}</td>
        `;
        tbody.appendChild(tr);
    });

    if (tbody.children.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="py-8 text-center text-slate-500">
                    <i class="fa-solid fa-search text-2xl mb-2 block opacity-50"></i>
                    لا توجد نتائج مطابقة لليوم المحدد
                </td>
            </tr>
        `;
    }
}

/**
 * تعيين رقم اليوم للبحث
 */
export function setSearchedDay(day) {
    searchedDayNumber = day;
}

/**
 * دالة مساعدة
 */
function setTextIfExists(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}