/**
 * Ivy — Interactive Script & Countdown Engine
 * Target: 16:00:00 Swedish Timezone (Europe/Stockholm - CET/CEST)
 */

document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initParticleCanvas();
});

/**
 * Computes next occurrence of Friday 16:00:00 in Europe/Stockholm (Sweden) time zone.
 */
function getTargetTime() {
    const now = new Date();
    
    // Format current time parts in Sweden (Stockholm) timezone
    const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Stockholm',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        weekday: 'short',
        hour12: false
    });

    const parts = dtf.formatToParts(now);
    const dateMap = {};
    for (const p of parts) {
        dateMap[p.type] = p.value;
    }

    const sweYear = parseInt(dateMap.year, 10);
    const sweMonth = parseInt(dateMap.month, 10);
    const sweDay = parseInt(dateMap.day, 10);
    const sweHour = parseInt(dateMap.hour, 10);
    const sweMinute = parseInt(dateMap.minute, 10);
    const sweSecond = parseInt(dateMap.second, 10);
    const sweWeekday = dateMap.weekday;

    const weekdayMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    const currentDayOfWeek = weekdayMap[sweWeekday] !== undefined ? weekdayMap[sweWeekday] : 1;

    // Calculate days until next Friday (Friday is day 5)
    let daysUntilFriday = (5 - currentDayOfWeek + 7) % 7;
    if (daysUntilFriday === 0 && (sweHour > 16 || (sweHour === 16 && (sweMinute > 0 || sweSecond > 0)))) {
        // Today is Friday and 16:00 has already passed; jump to next week's Friday
        daysUntilFriday = 7;
    }

    const targetDateObj = new Date(Date.UTC(sweYear, sweMonth - 1, sweDay + daysUntilFriday));
    const targetYear = targetDateObj.getUTCFullYear();
    const targetMonth = targetDateObj.getUTCMonth() + 1;
    const targetDay = targetDateObj.getUTCDate();

    // Format ISO string representing 16:00:00 on Friday in Sweden
    const pad = (n) => String(n).padStart(2, '0');
    const targetISO = `${targetYear}-${pad(targetMonth)}-${pad(targetDay)}T16:00:00`;

    // Calculate timezone offset for Stockholm at target date
    const sweTargetDate = new Date(`${targetISO}Z`);
    const sweOffsetString = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Stockholm',
        timeZoneName: 'shortOffset'
    }).format(sweTargetDate);

    // Extract GMT/UTC offset (e.g., GMT+1 for CET or GMT+2 for CEST)
    let offsetMinutes = 60; // default +1 hr (CET)
    const match = sweOffsetString.match(/GMT([+-]\d+)(?::(\d+))?/);
    if (match) {
        const hours = parseInt(match[1], 10);
        const mins = match[2] ? parseInt(match[2], 10) : 0;
        offsetMinutes = hours * 60 + (hours < 0 ? -mins : mins);
    }

    // Convert Stockholm 16:00 to absolute UTC timestamp
    const targetUtcTimestamp = Date.UTC(targetYear, targetMonth - 1, targetDay, 16, 0, 0) - (offsetMinutes * 60 * 1000);
    return targetUtcTimestamp;
}

function initCountdown() {
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');
    const statusEl = document.getElementById('countdown-status');

    let targetTime = getTargetTime();

    function update() {
        const now = Date.now();
        let remaining = targetTime - now;

        if (remaining <= 0) {
            // Target reached; recalculate for next cycle
            targetTime = getTargetTime();
            remaining = targetTime - now;
        }

        const totalSec = Math.max(0, Math.floor(remaining / 1000));
        const days = Math.floor(totalSec / 86400);
        const hours = Math.floor((totalSec % 86400) / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;

        const pad = (n) => String(n).padStart(2, '0');

        if (daysEl) daysEl.textContent = pad(days);
        if (hoursEl) hoursEl.textContent = pad(hours);
        if (minutesEl) minutesEl.textContent = pad(minutes);
        if (secondsEl) secondsEl.textContent = pad(seconds);

        if (statusEl) {
            statusEl.textContent = `Target: Friday 16:00:00 Swedish Time (Europe/Stockholm) • Syncing Live`;
        }
    }

    update();
    setInterval(update, 1000);
}

/**
 * Astral-style Starfield Background Canvas
 */
function initParticleCanvas() {
    const canvas = document.getElementById('starfield') || document.getElementById('ambient-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const stars = [];
    const count = Math.min(120, Math.floor((width * height) / 12000));

    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.4 + 0.4,
            baseAlpha: Math.random() * 0.7 + 0.2,
            twinkleSpeed: (Math.random() * 0.02 + 0.005),
            twinklePhase: Math.random() * Math.PI * 2,
            vy: -(Math.random() * 0.15 + 0.05)
        });
    }

    function render() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];

            s.y += s.vy;
            if (s.y < 0) {
                s.y = height;
                s.x = Math.random() * width;
            }

            s.twinklePhase += s.twinkleSpeed;
            const alpha = s.baseAlpha + Math.sin(s.twinklePhase) * 0.25;
            const clampedAlpha = Math.max(0.1, Math.min(1, alpha));

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${clampedAlpha})`;
            ctx.fill();
        }

        requestAnimationFrame(render);
    }

    render();
}
