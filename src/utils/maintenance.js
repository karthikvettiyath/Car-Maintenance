export const calculateServiceStatus = (serviceType, schedule, currentMileage) => {
    // 1. Calculate KM-based status
    let kmStatus = 'OK';
    let kmDue = null;
    let kmRemaining = null;

    if (serviceType.interval_km > 0) {
        kmDue = (schedule.last_performed_mileage || 0) + serviceType.interval_km;
        kmRemaining = kmDue - currentMileage;

        if (kmRemaining <= 0) kmStatus = 'DUE';
        else if (kmRemaining <= 1000) kmStatus = 'UPCOMING';
    }

    // 2. Calculate Time-based status
    let timeStatus = 'OK';
    let dateDue = null;
    let daysRemaining = null;

    if (serviceType.interval_months > 0) {
        const lastDate = new Date(schedule.last_performed_date);
        dateDue = new Date(lastDate.setMonth(lastDate.getMonth() + serviceType.interval_months));

        const now = new Date();
        const diffTime = dateDue - now;
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysRemaining <= 0) timeStatus = 'DUE';
        else if (daysRemaining <= 30) timeStatus = 'UPCOMING';
    }

    // 3. Combined Logic (Priority: DUE > UPCOMING > OK)
    let finalStatus = 'OK';
    let reason = '';

    if (kmStatus === 'DUE' || timeStatus === 'DUE') {
        finalStatus = 'DUE';
        reason = kmStatus === 'DUE'
            ? `Overdue by ${Math.abs(kmRemaining).toLocaleString()} km`
            : `Overdue by ${Math.abs(daysRemaining)} days`;
    } else if (kmStatus === 'UPCOMING' || timeStatus === 'UPCOMING') {
        finalStatus = 'UPCOMING';
        reason = kmStatus === 'UPCOMING'
            ? `Due in ${kmRemaining.toLocaleString()} km`
            : `Due in ${daysRemaining} days`;
    } else {
        finalStatus = 'OK';
        reason = kmRemaining !== null
            ? `${kmRemaining.toLocaleString()} km left`
            : `${daysRemaining} days left`;
    }

    return {
        status: finalStatus,
        reason,
        dateDue: dateDue ? dateDue.toISOString().split('T')[0] : null,
        kmDue,
        serviceName: serviceType.name
    };
};
