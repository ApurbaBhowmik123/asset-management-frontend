   export const calculateSLAStatus = (ticket) => {
    if (!ticket?.supportEngineerAssignedAt || !ticket?.completedAt) {
        return null;
    }

    const SLADurations = {
        High: 4,
        Medium: 8,
        Low: 24,
    };

    const assignedTime = new Date(ticket.supportEngineerAssignedAt);
    const completedTime = new Date(ticket.completedAt);
    

    const timeDiffHours = Math.abs(completedTime - assignedTime) / (1000 * 60 * 60);
    

    const requiredSLA = SLADurations[ticket.priority] || 24;
    
    return {
        onTime: timeDiffHours <= requiredSLA,
        timeTaken: timeDiffHours.toFixed(2),
        requiredSLA,
    };
    };
