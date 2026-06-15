// utils/dateTimeHelper.js
export const dateTimeHelper = {
  // Get current date in YYYY-MM-DD format
  getCurrentDate: () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  },

  // Get current time in HH:mm:ss format
  getCurrentTime: () => {
    const today = new Date();
    return today.toTimeString().split(" ")[0];
  },

  // Get full date-time in ISO format
  getCurrentDateTime: () => {
    return new Date().toISOString();
  },

  // Format a given date to custom format (DD/MM/YYYY or similar)
  formatDate: (date, format = "DD/MM/YYYY") => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    switch (format) {
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`;
      default: // DD/MM/YYYY
        return `${day}/${month}/${year}`;
    }
  },

  // formatGivenDate: (date) => {
  //   if (!date) return null;
  //   try {
  //     const dateObj = date instanceof Date ? date : new Date(date);
  //     if (isNaN(dateObj.getTime())) return null;
  //     return dateObj.toISOString().split("T")[0];
  //   } catch (error) {
  //     console.error("Error formatting date:", error);
  //     return null;
  //   }
  // },
  formatGivenDate: (date) => {
    if (!date) return null;
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return null;

      // Use local date components but format as ISO string
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return null;
    }
  },




  // Add or subtract days from a date
  addDays: (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  },
};
