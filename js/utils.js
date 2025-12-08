export function getTimePosition(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    let adjustedH = h;
    if (h < 8) adjustedH += 24;
    const minutesFromBase = (adjustedH - 8) * 60 + m;
    const percent = (minutesFromBase / 1440) * 100;
    return percent;
}

export function getTimeStringFromPosition(percent) {
    // 0% = 08:00
    // 100% = 08:00 (next day)
    const totalMinutes = Math.round((percent / 100) * 1440);
    let minutesFromBase = totalMinutes;

    // Base is 08:00
    let h = Math.floor(minutesFromBase / 60) + 8;
    let m = minutesFromBase % 60;

    if (h >= 24) h -= 24;

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function formatTimeDisplay(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    const displayM = m === 0 ? '' : `:${m.toString().padStart(2, '0')}`;
    return `${displayH}${displayM} ${suffix}`;
}

export function formatDate(date) {
    return date;
}
