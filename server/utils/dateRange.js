function getDateRange(range, startDate, endDate) {
  const now = new Date();
  let start;
  let end = new Date();

  if (range === "week") {
    start = new Date();
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } 
  else if (range === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
  } 
  else if (range === "year") {
    start = new Date(now.getFullYear(), 0, 1);
    start.setHours(0, 0, 0, 0);
  } 
  else if (range === "custom") {
    if (!startDate || !endDate) {
      throw new Error("Start date and end date are required for custom range");
    }

    start = new Date(startDate);
    end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } 
  else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
  }

  return { start, end };
}

module.exports = getDateRange;