// ============================================================
// search.js — البحث عن يوم + الانتقال لليوم
// ============================================================

import { showToast } from './utils.js';
import { setSearchedDay, renderTable, buildMonthNavigation, switchMonth } from './table.js';
import { renderUpcomingDays } from './upcoming.js';

/**
 * تهيئة البحث والانتقال
 */
export function initSearch() {
    const input = document.getElementById('daySearchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    const jumpBtn = document.getElementById('jumpTodayBtn');

    input?.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (val >= 1 && val <= 31) {
            setSearchedDay(val);
            clearBtn?.classList.remove('hidden');
        } else {
            setSearchedDay(null);
            clearBtn?.classList.add('hidden');
        }
        renderTable();
    });

    clearBtn?.addEventListener('click', () => {
        if (input) input.value = '';
        setSearchedDay(null);
        clearBtn.classList.add('hidden');
        renderTable();
    });

    jumpBtn?.addEventListener('click', () => {
        const now = new Date();
        const monthId = now.getMonth() + 1;
        const day = now.getDate();

        localStorage.setItem('activeMonthId', monthId);
        setSearchedDay(day);
        if (input) input.value = day;
        clearBtn?.classList.remove('hidden');

        buildMonthNavigation();
        switchMonth(monthId);
        renderUpcomingDays();

        showToast('تم الانتقال إلى تاريخ اليوم');

        const tableCard = document.getElementById('prayerTableBody')?.closest('.glass-card');
        if (tableCard) tableCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}