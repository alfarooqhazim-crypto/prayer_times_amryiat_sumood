// ============================================================
// notifications.js — إشعارات الأذان
// ============================================================

import { parseTimeToDate, getMonthData, showToast } from './utils.js';

let notificationsEnabled = localStorage.getItem('prayer-notif') === 'true';
const notifiedPrayers = new Set();

/**
 * تحديث زر الإشعارات
 */
export function updateNotifBtn() {
    const btn = document.getElementById('enableNotificationsBtn');
    const txt = document.getElementById('notifBtnText');
    const icon = document.getElementById('notifIcon');
    if (!btn || !txt || !icon) return;

    const hasPermission = typeof Notification !== 'undefined' && Notification.permission === 'granted';

    if (notificationsEnabled && hasPermission) {
        txt.textContent = 'الإشعارات مفعّلة ✓';
        btn.classList.add('bg-emerald-600/20', 'text-emerald-400', 'border-emerald-500/30');
        btn.classList.remove('bg-amber-500/10', 'text-amber-400');
        icon.className = 'fa-solid fa-bell bell-pulse';
    } else {
        txt.textContent = 'تفعيل إشعارات الأذان';
        btn.classList.remove('bg-emerald-600/20', 'text-emerald-400', 'border-emerald-500/30');
        btn.classList.add('bg-amber-500/10', 'text-amber-400');
        icon.className = 'fa-solid fa-bell';
    }
}

/**
 * تفعيل/تعطيل الإشعارات
 */
export async function toggleNotifications() {
    if (!('Notification' in window)) {
        showToast('المتصفح لا يدعم الإشعارات', 'error');
        return;
    }

    if (notificationsEnabled && Notification.permission === 'granted') {
        notificationsEnabled = false;
        localStorage.setItem('prayer-notif', 'false');
        updateNotifBtn();
        showToast('تم تعطيل الإشعارات');
        return;
    }

    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
        notificationsEnabled = true;
        localStorage.setItem('prayer-notif', 'true');
        try {
            new Notification('تم تفعيل الإشعارات 🕌', {
                body: 'سنُنبّهك قبل كل أذان بـ 10 دقائق بإذن الله',
                icon: 'icons/icon-192.png'
            });
        } catch(e) {}
        showToast('تم تفعيل إشعارات الأذان');
    } else {
        notificationsEnabled = false;
        localStorage.setItem('prayer-notif', 'false');
        showToast('لم يتم منح الإذن للإشعارات', 'error');
    }
    updateNotifBtn();
}

/**
 * التحقق من الإشعارات (تُستدعى كل ثانية من clock.js)
 */
export function checkPrayerNotifications() {
    if (!notificationsEnabled || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    const now = new Date();
    const realMonth = now.getMonth() + 1;
    const realDay = now.getDate();
    const monthData = getMonthData(realMonth);
    if (!monthData) return;
    const dayData = monthData.days.find(d => d.day === realDay);
    if (!dayData) return;

    const prayerList = [
        { name: 'الفجر', time: dayData.fajr, isPM: false },
        { name: 'الظهر', time: dayData.dhuhr, isPM: false },
        { name: 'العصر', time: dayData.asr, isPM: true },
        { name: 'المغرب', time: dayData.maghrib, isPM: true },
        { name: 'العشاء', time: dayData.isha, isPM: true },
    ];

    prayerList.forEach(p => {
        const pDate = parseTimeToDate(p.time, p.isPM);
        const diffMin = Math.round((pDate - now) / 60000);

        // إشعار قبل 10 دقائق
        const key10 = `${realDay}-${p.name}-10`;
        if (diffMin === 10 && !notifiedPrayers.has(key10)) {
            notifiedPrayers.add(key10);
            try {
                new Notification(`اقترب وقت صلاة ${p.name}`, {
                    body: `باقي 10 دقائق على أذان ${p.name} (${p.time})`,
                    tag: key10,
                    icon: 'icons/icon-192.png'
                });
            } catch(e) {}
        }

        // إشعار عند دخول الوقت
        const keyNow = `${realDay}-${p.name}-now`;
        if (diffMin === 0 && !notifiedPrayers.has(keyNow)) {
            notifiedPrayers.add(keyNow);
            try {
                new Notification(`حان الآن وقت صلاة ${p.name} 🕌`, {
                    body: `تقبّل الله منا ومنكم صالح الأعمال`,
                    tag: keyNow,
                    icon: 'icons/icon-192.png'
                });
            } catch(e) {}
        }
    });
}

/**
 * تهيئة زر الإشعارات
 */
export function initNotifications() {
    updateNotifBtn();
    document.getElementById('enableNotificationsBtn')?.addEventListener('click', toggleNotifications);
}