export const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);

export const format24h = (hour) => {
    return `${hour < 10 ? '0' + hour : hour}:00`;
};