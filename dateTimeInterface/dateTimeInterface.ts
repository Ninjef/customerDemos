export const getCurrentTimezoneAwareDateString = () => {
    const currentDate = new Date();
    return currentDate.toISOString();
};

export const getCurrentDayOfWeekString = () => {
    const currentDate = new Date();
    return currentDate.toLocaleString('en-us', { weekday: 'long' });
};
