export const ensureArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (data.length !== undefined) return Array.from(data);
    return [data];
  }
  return [];
};