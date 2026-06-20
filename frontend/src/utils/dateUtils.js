export const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getMonthName = (date) => {
  return new Date(date).toLocaleString("default", {
    month: "long",
  });
};
