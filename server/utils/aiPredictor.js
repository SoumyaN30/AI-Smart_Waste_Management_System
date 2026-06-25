const predictPriority = (category, description = "") => {
  const text = `${category} ${description}`.toLowerCase();

  let priority = "Medium";
  let aiReason = "Normal municipal service request.";
  let assignedDepartment = "General";

  // Department prediction
  if (
    category === "Household Garbage Pickup" ||
    category === "Area Garbage Pickup" ||
    category === "Clean Roadside Fallen Leaves"
  ) {
    assignedDepartment = "Garbage Collection";
  }

  if (
    category === "Public Washroom Cleaning" ||
    category === "Choked Drain" ||
    category === "Gutter Overflow"
  ) {
    assignedDepartment = "Sanitation";
  }

  // Low priority cases
  if (
    category === "Clean Roadside Fallen Leaves" &&
    !text.includes("main road") &&
    !text.includes("school") &&
    !text.includes("hospital")
  ) {
    priority = "Low";
    aiReason = "This is a low-risk cleaning task.";
  }

  // High priority cases
  if (
    text.includes("overflow") ||
    text.includes("blocked") ||
    text.includes("bad smell") ||
    text.includes("danger") ||
    text.includes("school") ||
    text.includes("hospital") ||
    text.includes("main road") ||
    text.includes("traffic") ||
    text.includes("public place")
  ) {
    priority = "High";
    aiReason =
      "This issue may affect public health, safety, or traffic movement.";
  }

  // Emergency priority cases
  if (
    text.includes("emergency") ||
    text.includes("accident") ||
    text.includes("sewage") ||
    text.includes("flood") ||
    text.includes("disease") ||
    text.includes("infection") ||
    text.includes("serious")
  ) {
    priority = "Emergency";
    aiReason = "This is a critical issue requiring immediate attention.";
  }

  return {
    priority,
    aiReason,
    assignedDepartment,
  };
};

module.exports = {
  predictPriority,
};