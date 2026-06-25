import axios from "axios";

const API_URL = "http://localhost:5000/api/admin";

const getToken = () => {
  return sessionStorage.getItem("token");
};

export const fetchAdminAnalytics = async (filters) => {
  const token = getToken();

  const params = new URLSearchParams(filters).toString();

  const response = await axios.get(`${API_URL}/analytics?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const downloadCSVReport = async (filters) => {
  const token = getToken();

  const params = new URLSearchParams(filters).toString();

  const response = await axios.get(`${API_URL}/report/csv?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "smart-waste-report.csv");
  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};