import React from 'react'

function StatusBadge({ slots, totalSlots }) {
    // Ensure we are working with numbers
    const s = parseInt(slots, 10);
    const t = parseInt(totalSlots, 10);

    // Fallback if data is missing or corrupted during a state refresh
    if (isNaN(s) || isNaN(t) || t <= 0) {
        return (
            <span className="badge bg-secondary py-2 px-3 shadow-sm">
                <i className="fas fa-exclamation-circle me-1"></i> NO CAPACITY SET
            </span>
        );
    }

    // displaySlots is the "Current Availability" calculated by your Django @property
    const displaySlots = Math.max(0, s);
    const percentage = (displaySlots / t) * 100;
    
    let color = 'bg-success';
    let text = 'AVAILABLE';
    let icon = 'fa-check-circle';

    // 1. Logic for "FULL" (Single or Weekly reservations filled the gap)
    if (displaySlots <= 0) {
        color = 'bg-danger'; 
        text = 'FULL';
        icon = 'fa-times-circle';
    } 
    // 2. Logic for "ALMOST FULL" (Less than 20% remaining)
    else if (percentage <= 20) {
        color = 'bg-warning text-dark'; 
        text = 'ALMOST FULL';
        icon = 'fa-exclamation-triangle';
    }
    // 3. NEW: Logic for "LIMITED" (Between 20% and 50% remaining)
    // This helps visualize the impact of multiple/weekly reservations
    else if (percentage <= 50) {
        color = 'bg-info text-white'; 
        text = 'LIMITED';
        icon = 'fa-hourglass-half';
    }

    return (
        <span 
            className={`badge ${color} py-2 px-3 shadow-sm border-0`}
            style={{ transition: 'all 0.4s ease-in-out', minWidth: '120px' }}
            title={`${displaySlots} spots remaining out of ${t}`}
        >
            <i className={`fas ${icon} me-1`}></i>
            {text}: {displaySlots} / {t} Left
        </span>
    );
}

export default StatusBadge;