// ============================================================
// hijri.js — التاريخ الهجري والميلادي
// ============================================================

/**
 * تحديث التاريخ الهجري في الهيدر
 */
export function updateHijriDate() {
    const el = document.getElementById('hijriDate');
    if (!el) return;

    try {
        const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            day: 'numeric', month: 'long', year: 'numeric'
        }).format(new Date());
        el.innerText = hijri + ' هـ';
    } catch (e) {
        try {
            const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
                day: 'numeric', month: 'long', year: 'numeric'
            }).format(new Date());
            el.innerText = hijri + ' هـ';
        } catch (e2) {
            el.innerText = '';
        }
    }
}

/**
 * تحديث التاريخ الميلادي في الهيدر
 */
export function updateGregorianDate() {
    const el = document.getElementById('todayDateStr');
    if (!el) return;
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    el.innerText = new Date().toLocaleDateString('ar-IQ', dateOptions);
}

/**
 * تهيئة التواريخ
 */
export function initDates() {
    updateGregorianDate();
    updateHijriDate();

    // تحديث التاريخ الهجري كل دقيقة (يتغير فقط عند منتصف الليل فعلياً)
    setInterval(updateHijriDate, 60000);

    // تحديث التاريخ الميلادي كل ساعة
    setInterval(updateGregorianDate, 3600000);
}