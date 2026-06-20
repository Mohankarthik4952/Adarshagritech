const getFinancialYear = (date = new Date()) => {
  const currentDate = new Date(date);

  const year = currentDate.getFullYear();

  // Financial year: April → March
  // Example:
  // Apr 2025 - Mar 2026 => "2025-2026"

  if (currentDate.getMonth() >= 3) {
    return `${year}-${year + 1}`;
  }

  return `${year - 1}-${year}`;
};

export default getFinancialYear;
