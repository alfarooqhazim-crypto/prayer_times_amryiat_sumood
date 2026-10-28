// ============================================================
// clock.js — الساعة الحية والعد التنازلي للصلاة القادمة
// ============================================================

import { parseTimeToDate, getMonthData, formatTimeArabic } from './utils.js';
import { checkPrayerNotifications } from './notifications.js';

// حالة مشتركة (تُحدَّث من table.js عند تبديل الشهر)
export let currentActiveMonthId = new Date().getMonth() + 1;

/**
 * تعيين الشهر النشط
 */
export function setActiveMonth(monthId) {
    currentActiveMonthId = monthId;
}

/**
 * بدء الساعة والعد التنازلي
 */
export function startClockAndCountdown() {
    setInterval(() => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const clockEl = document.getElementById('liveClock');
        if (clockEl) clockEl.innerText = `${hours}:${minutes}:${seconds}`;

        updateCountdownAndSummary();
        checkPrayerNotifications();
    }, 1000);

    updateCountdownAndSummary();
}

/**
 * تحديث بطاقة الصلاة القادمة والعد التنازلي
 */
export function updateCountdownAndSummary() {
    const now = new Date();
    const realMonth = now.getMonth() + 1;
    const realDay = now.getDate();

    const activeMonthData = getMonthData(currentActiveMonthId);
    if (!activeMonthData) return;

    let dayData;
    if (currentActiveMonthId === realMonth) {
        dayData = activeMonthData.days.find(d => d.day === realDay) || activeMonthData.days[0];
    } else {
        dayData = activeMonthData.days[0];
    }

    // تحديث شريط المواقيت
    setTextIfExists('val-fajr', dayData.fajr);
    setTextIfExists('val-sunrise', dayData.sunrise);
    setTextIfExists('val-dhuhr', dayData.dhuhr);
    setTextIfExists('val-asr', dayData.asr);
    setTextIfExists('val-maghrib', dayData.maghrib);
    setTextIfExists('val-isha', dayData.isha);

    // قائمة الصلوات
    const prayers = [
        { name: 'صلاة الفجر', key: 'fajr', timeDate: parseTimeToDate(dayData.fajr, false) },
        { name: 'الشروق', key: 'sunrise', timeDate: parseTimeToDate(dayData.sunrise, false) },
        { name: 'صلاة الظهر', key: 'dhuhr', timeDate: parseTimeToDate(dayData.dhuhr, false) },
        { name: 'صلاة العصر', key: 'asr', timeDate: parseTimeToDate(dayData.asr, true) },
        { name: 'صلاة المغرب', key: 'maghrib', timeDate: parseTimeToDate(dayData.maghrib, true) },
        { name: 'صلاة العشاء', key: 'isha', timeDate: parseTimeToDate(dayData.isha, true) }
    ];

    let nextPrayer = prayers.find(p => p.timeDate > now);

    // إزالة التمييز من كل الشرائط
    document.querySelectorAll('#strip-fajr, #strip-sunrise, #strip-dhuhr, #strip-asr, #strip-maghrib, #strip-isha')
        .forEach(el => el.classList.remove('strip-active'));

    if (!nextPrayer) {
        const tomorrowFajrDate = new Date(prayers[0].timeDate);
        tomorrowFajrDate.setDate(tomorrowFajrDate.getDate() + 1);
        nextPrayer = { name: 'صلاة الفجر (غداً)', key: 'fajr', timeDate: tomorrowFajrDate };
    }

    // تمييز الشريط النشط
    const activeStrip = document.getElementById(`strip-${nextPrayer.key}`);
    if (activeStrip) activeStrip.classList.add('strip-active');

    // تحديث الاسم والوقت
    setTextIfExists('nextPrayerName', nextPrayer.name);

    const displayTime = prayers.find(p => p.key === nextPrayer.key)
        ?.timeDate.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }) || '';
    setTextIfExists('nextPrayerTime', `الموعد: ${displayTime}`);

    // العد التنازلي
    const diffMs = nextPrayer.timeDate - now;
    if (diffMs > 0) {
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

        setTextIfExists('countdownTimer',
            `${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`);
    } else {
        setTextIfExists('countdownTimer', '00:00:00');
    }
}

/**
 * دالة مساعدة: تحديث نص عنصر إن وُجد
 */
function setTextIfExists(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}