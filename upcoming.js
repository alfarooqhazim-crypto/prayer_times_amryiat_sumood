// ============================================================
// upcoming.js — بطاقة الأيام السبعة القادمة
// ============================================================

import { getMonthData } from './utils.js';

/**
 * عرض الأيام السبعة القادمة
 */
export function renderUpcomingDays() {
    const grid = document.getElementById('upcomingDaysGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const now = new Date();
    const dayNames = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

    for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        const m = d.getMonth() + 1;
        const day = d.getDate();
        const monthData = getMonthData(m);
        if (!monthData) continue;
        const dayData = monthData.days.find(x => x.day === day);
        if (!dayData) continue;

        const isToday = i === 0;
        const card = document.createElement('div');
        card.className = `glass-card rounded-xl p-3 text-center border upcoming-card ${isToday ? 'border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-slate-800'}`;
        card.innerHTML = `
            <div class="text-xs font-bold ${isToday ? 'text-emerald-400' : 'text-slate-400'} mb-1">
                ${isToday ? 'اليوم' : dayNames[d.getDay()]}
            </div>
            <div class="text-sm font-bold text-white mb-2">${day} ${monthData.nameAr}</div>
            <div class="space-y-1 text-[11px]">
                <div class="flex justify-between text-slate-400"><span>الفجر</span><span class="font-mono text-amber-400">${dayData.fajr}</span></div>
                <div class="flex justify-between text-slate-400"><span>الظهر</span><span class="font-mono text-amber-400">${dayData.dhuhr}</span></div>
                <div class="flex justify-between text-slate-400"><span>العصر</span><span class="font-mono text-amber-400">${dayData.asr}</span></div>
                <div class="flex justify-between text-slate-400"><span>المغرب</span><span class="font-mono text-amber-400">${dayData.maghrib}</span></div>
                <div class="flex justify-between text-slate-400"><span>العشاء</span><span class="font-mono text-amber-400">${dayData.isha}</span></div>
            </div>
        `;
        grid.appendChild(card);
    }
}