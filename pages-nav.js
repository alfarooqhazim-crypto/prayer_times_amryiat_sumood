// ============================================================
// pages-nav.js — التنقل بين الصفحات + الثيم
// ============================================================

// تطبيق الثيم المحفوظ
(function() {
    const savedTheme = localStorage.getItem('prayer-theme') || 'dark';
    const html = document.documentElement;
    if (savedTheme === 'light') {
        html.classList.remove('dark');
    } else {
        html.classList.add('dark');
    }
})();

// زر تبديل الثيم
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    
    function updateIcon() {
        const isDark = document.documentElement.classList.contains('dark');
        if (icon) icon.className = isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
    updateIcon();

    toggle?.addEventListener('click', () => {
        const html = document.documentElement;
        const current = localStorage.getItem('prayer-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        
        if (next === 'light') {
            html.classList.remove('dark');
        } else {
            html.classList.add('dark');
        }
        localStorage.setItem('prayer-theme', next);
        updateIcon();
    });
});