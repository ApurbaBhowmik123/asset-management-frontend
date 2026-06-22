export const ProductRequestStatus = Object.freeze({
  InStock: "InStock",
  BLOCKED: "BLOCKED",
  Assigned: "Assigned",
  WRITE_OFF: "WRITE_OFF",
  E_WASTE: "E-WASTE",
  SCRAP: "Scrap",
  SCRAP: "SCRAP"
});

const statusLabels = {
  InStock: "In Stock",
  BLOCKED: "Blocked",
  Assigned: "Assigned",
  WRITE_OFF: "Write Off",
  E_WASTE: "E-WASTE",
  SCRAP: "Scrap"
};

const statusColors = {
  InStock: { color: "#28A745", bg: "#E6FFFA" },
  BLOCKED: { color: "#DC2626", bg: "#FEE2E2" },
  Assigned: { color: "#2563EB", bg: "#DBEAFE" },
  WRITE_OFF: { color: "#D97706", bg: "#FFF7E6" },
  E_WASTE: { color: "#D97706", bg: "#FFF7E6" },
  SCRAP: { color: "#B91C1C", bg: "#FEF2F2" },
};

export const productStatusHelper = {
  normalize(status) {
    if (!status) return null;

    const upper = status.toUpperCase();

    // Normalize backend variants
    if (upper === "INSTOCK" || upper === "INSTALLATIONCOMPLETED" || upper === "IN STOCK" || upper==="InStock") return "InStock";
    if (upper === "ASSIGNED") return "Assigned";
    if (upper === "WRITE-OFF" || upper === "WRITEOFF") return "WRITE_OFF";
    if (upper === "BLOCKED" || upper === "BLOCK") return "BLOCKED";
    if (upper === "E_WASTE" || upper === "E-WASTE") return "E_WASTE";
    if (upper === "SCRAP") return "SCRAP";

    return status;
  },
  

  getLabel(status) {
    const normalized = this.normalize(status);
    return statusLabels[normalized] || "Unknown";
  },

  getStyle(status) {
    const normalized = this.normalize(status);
    return (
      statusColors[normalized] || { color: "#6B7280", bg: "#F3F4F6" } // default gray
    );
  },
};
