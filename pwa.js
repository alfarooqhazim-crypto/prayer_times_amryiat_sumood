// ============================================================
// pwa.js — تسجيل Service Worker والتثبيت
// ============================================================

import { showToast } from './utils.js';

let deferredPrompt = null;

/**
 * تهيئة PWA
 */
export function initPWA() {
    registerServiceWorker();
    setupInstallPrompt();
    setupOnlineOfflineIndicator();
    setupIOSHint();
    hideBannersIfInstalled();
}

/**
 * تسجيل Service Worker
 */
function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js', { scope: './' })
            .then(reg => {
                console.log('✅ Service Worker registered:', reg.scope);
                const swStatus = document.getElementById('swStatus');
                if (swStatus) swStatus.textContent = '✓ التطبيق جاهز للعمل بدون إنترنت';

                // اكتشاف تحديثات جديدة
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                showToast('🔄 يتوفر تحديث جديد - أعد تحميل الصفحة', 'info');
                            }
                        });
                    }
                });
            })
            .catch(err => {
                console.warn('❌ SW registration failed:', err);
                const swStatus = document.getElementById('swStatus');
                if (swStatus) swStatus.textContent = '⚠️ تعذر تفعيل العمل بدون إنترنت';
            });

        // عند تحديث SW
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });
    });
}

/**
 * إعداد prompt التثبيت
 */
function setupInstallPrompt() {
    const installBanner = document.getElementById('installBanner');
    const installAcceptBtn = document.getElementById('installAcceptBtn');
    const installDismissBtn = document.getElementById('installDismissBtn');
    const installAppBtn = document.getElementById('installAppBtn');
    const headerInstallBtn = document.getElementById('headerInstallBtn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('💾 beforeinstallprompt captured');

        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed && installBanner) installBanner.classList.add('visible');
        if (installAppBtn) installAppBtn.style.display = 'flex';
        if (headerInstallBtn) headerInstallBtn.classList.add('visible');
    });

    // دالة موحدة للتثبيت
    async function triggerInstall() {
        if (!deferredPrompt) {
            showToast('التثبيت غير متاح حالياً', 'info');
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('👤 Install outcome:', outcome);
        deferredPrompt = null;
        installBanner?.classList.remove('visible');
        if (installAppBtn) installAppBtn.style.display = 'none';
        if (headerInstallBtn) headerInstallBtn.classList.remove('visible');

        if (outcome === 'accepted') {
            showToast('🎉 تم تثبيت التطبيق بنجاح');
        }
    }

    installAcceptBtn?.addEventListener('click', triggerInstall);
    installAppBtn?.addEventListener('click', triggerInstall);
    headerInstallBtn?.addEventListener('click', triggerInstall);

    installDismissBtn?.addEventListener('click', () => {
        installBanner?.classList.remove('visible');
        localStorage.setItem('pwa-install-dismissed', 'true');
    });

    // بعد التثبيت
    window.addEventListener('appinstalled', () => {
        console.log('✅ PWA installed');
        installBanner?.classList.remove('visible');
        if (installAppBtn) installAppBtn.style.display = 'none';
        if (headerInstallBtn) headerInstallBtn.classList.remove('visible');
        deferredPrompt = null;
        showToast('🎉 التطبيق أصبح متاحاً على شاشتك الرئيسية');

        // طلب إذن الإشعارات بعد التثبيت
        if ('Notification' in window && Notification.permission === 'default') {
            setTimeout(() => {
                Notification.requestPermission().then(perm => {
                    console.log('🔔 Notification permission:', perm);
                });
            }, 2500);
        }
    });
}

/**
 * مؤشر Online/Offline
 */
function setupOnlineOfflineIndicator() {
    function update() {
        if (navigator.onLine) {
            document.body.classList.remove('is-offline');
        } else {
            document.body.classList.add('is-offline');
            showToast('⚠️ أنت غير متصل - التطبيق يعمل من النسخة المحفوظة', 'info');
        }
    }
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
}

/**
 * تلميح التثبيت على iOS
 */
function setupIOSHint() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone === true ||
        window.matchMedia('(display-mode: standalone)').matches;

    if (isIOS && !isStandalone) {
        const hint = document.getElementById('iosInstallHint');
        const closeBtn = document.getElementById('iosHintClose');
        const dismissed = localStorage.getItem('pwa-ios-hint-dismissed');

        if (!dismissed && hint) {
            setTimeout(() => hint.classList.add('visible'), 4000);
        }

        closeBtn?.addEventListener('click', () => {
            hint?.classList.remove('visible');
            localStorage.setItem('pwa-ios-hint-dismissed', 'true');
        });
    }
}

/**
 * إخفاء البانرات إذا كان التطبيق مثبتاً
 */
function hideBannersIfInstalled() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;

    if (isStandalone) {
        document.getElementById('installBanner')?.remove();
        const appBtn = document.getElementById('installAppBtn');
        if (appBtn) appBtn.style.display = 'none';
        document.getElementById('headerInstallBtn')?.classList.remove('visible');
    }
}