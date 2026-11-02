/**
 * Ivy — Interactive Script & Countdown Engine
 * Target: 16:00:00 Swedish Timezone (Europe/Stockholm - CET/CEST)
 */

document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initParticleCanvas();
});

/**
 * Computes next occurrence of 16:00:00 in Europe/Stockholm (Sweden) time zone.
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

    // Target is 16:00 (4:00 PM) Swedish time
    let targetDay = sweDay;
    let targetMonth = sweMonth;
    let targetYear = sweYear;

    if (sweHour > 16 || (sweHour === 16 && (sweMinute > 0 || sweSecond > 0))) {
        // 16:00 has already passed today in Sweden; target tomorrow 16:00
        const tomorrow = new Date(Date.UTC(sweYear, sweMonth - 1, sweDay + 1));
        targetYear = tomorrow.getUTCFullYear();
        targetMonth = tomorrow.getUTCMonth() + 1;
        targetDay = tomorrow.getUTCDate();
    }

    // Format ISO string representing 16:00:00 in Sweden
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
            statusEl.textContent = `Target: 16:00:00 Swedish Time (Europe/Stockholm) • Syncing Live`;
        }
    }

    update();
    setInterval(update, 1000);
}

/**
 * Ambient Glowing Particle Canvas
 */
function initParticleCanvas() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(65, Math.floor((width * height) / 18000));

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            radius: Math.random() * 1.8 + 0.8,
            color: Math.random() > 0.4 ? 'rgba(0, 245, 155, ' : 'rgba(0, 210, 255, ',
            alpha: Math.random() * 0.5 + 0.2
        });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function render() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.alpha + ')';
            ctx.fill();

            // Connect nearby particles
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 110) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    const linkAlpha = (1 - dist / 110) * 0.15;
                    ctx.strokeStyle = `rgba(0, 245, 155, ${linkAlpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }

            // Connection to mouse cursor
            const mdx = p.x - mouseX;
            const mdy = p.y - mouseY;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mDist < 140) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouseX, mouseY);
                const mouseAlpha = (1 - mDist / 140) * 0.22;
                ctx.strokeStyle = `rgba(0, 210, 255, ${mouseAlpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        requestAnimationFrame(render);
    }

    render();
}
