import { useEffect, useState } from "react";
import axios from "axios";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function AdminDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const styles = commonStyles(isDarkMode);

  const token = sessionStorage.getItem("token") || sessionStorage.getItem("token");
  const adminName = sessionStorage.getItem("name") || "Admin";
  const adminEmail = sessionStorage.getItem("email") || "admin@smartwaste.com";

  const API_BASE = "http://localhost:5000";

  const [requests, setRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);

  const [activeSection, setActiveSection] = useState("overview");

  const [requestFilter, setRequestFilter] = useState("all");
  const [citizenComplaintFilter, setCitizenComplaintFilter] = useState("all");
  const [workerComplaintFilter, setWorkerComplaintFilter] = useState("all");

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [reportRange, setReportRange] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  const getHeaders = () => {
    return {
      Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token}`,
    };
  };

  const getReportParams = () => {
    const params = {
      range: reportRange,
    };

    if (reportRange === "custom") {
      params.startDate = startDate;
      params.endDate = endDate;
    }

    return params;
  };

  const fetchData = async () => {
    try {
      const reqRes = await axios.get(`${API_BASE}/api/requests`, {
        headers: getHeaders(),
      });

      const compRes = await axios.get(`${API_BASE}/api/complaints`, {
        headers: getHeaders(),
      });

      setRequests(reqRes.data);
      setComplaints(compRes.data);
    } catch (err) {
      console.log("Fetch admin data error:", err);
      if (err.response?.status === 401) {
        alert("Session expired or token missing. Please login again.");
        window.location.href = "/login";
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);

      const res = await axios.get(`${API_BASE}/api/admin/analytics`, {
        headers: getHeaders(),
        params: getReportParams(),
      });

      setAnalytics(res.data);
    } catch (err) {
      console.log("Analytics error:", err);
      if (err.response?.status === 401) {
        alert("Session expired or token missing. Please login again.");
        window.location.href = "/login";
        return;
      }
      alert(err.response?.data?.message || err.response?.data?.msg || "Failed to load analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const downloadCSVReport = async () => {
    try {
      if (reportRange === "custom" && (!startDate || !endDate)) {
        alert("Please select both start date and end date");
        return;
      }

      setReportLoading(true);

      const res = await axios.get(`${API_BASE}/api/admin/csv-report`, {
        headers: getHeaders(),
        params: getReportParams(),
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      let fileName = `smart-waste-report-${reportRange}.csv`;

      if (reportRange === "custom") {
        fileName = `smart-waste-report-${startDate}-to-${endDate}.csv`;
      }

      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to download CSV report");
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      alert("Please login again. Token missing.");
      window.location.href = "/login";
      return;
    }

    fetchData();
    fetchAnalytics();

    const interval = setInterval(() => {
      fetchData();
      fetchAnalytics();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (reportRange !== "custom") {
      fetchAnalytics();
    }
  }, [reportRange]);

  const sendRequestNotice = async (id) => {
    try {
      await axios.put(
        `${API_BASE}/api/requests/${id}/send-notice`,
        {},
        { headers: getHeaders() }
      );

      fetchData();
      fetchAnalytics();
    } catch (err) {
      alert(err.response?.data?.msg || "Notice failed");
    }
  };

  const sendCitizenComplaintNotice = async (id) => {
    try {
      await axios.put(
        `${API_BASE}/api/complaints/${id}/send-notice`,
        {},
        { headers: getHeaders() }
      );

      fetchData();
      fetchAnalytics();
    } catch (err) {
      alert(err.response?.data?.msg || "Notice failed");
    }
  };

  const adminAcceptWorkerComplaint = async (id) => {
    try {
      await axios.put(
        `${API_BASE}/api/complaints/${id}/admin-accept`,
        {},
        { headers: getHeaders() }
      );

      fetchData();
      fetchAnalytics();
    } catch (err) {
      alert(err.response?.data?.msg || "Accept failed");
    }
  };

  const adminCompleteWorkerComplaint = async (id) => {
    try {
      await axios.put(
        `${API_BASE}/api/complaints/${id}/admin-complete`,
        {},
        { headers: getHeaders() }
      );

      fetchData();
      fetchAnalytics();
    } catch (err) {
      alert(err.response?.data?.msg || "Complete failed");
    }
  };

  const logout = () => {
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const getRequestPriority = (item) => {
    const category = String(item?.category || item || "").trim().toLowerCase();

    if (category === "gutter overflow" || category === "choked drain") {
      return "High";
    }

    return "Medium";
  };

  const getPriorityLabel = (priority) => {
    if (priority === "High") return "High Priority";
    return "Medium Priority";
  };

  const getPriorityRank = (item) => {
    return getRequestPriority(item) === "High" ? 0 : 1;
  };

  const getPriorityReason = (item) => {
    const priority = getRequestPriority(item);

    if (priority === "High") {
      return "Emergency sanitation issue. This request needs quick action.";
    }

    return "Normal municipal service request.";
  };

  const citizenComplaints = complaints.filter((c) => c.raisedBy === "citizen");
  const workerComplaints = complaints.filter((c) => c.raisedBy === "worker");

  const workerNoticesFromRequests = requests.filter((r) => r.noticeSent);
  const workerNoticesFromComplaints = citizenComplaints.filter(
    (c) => c.noticeSent
  );

  const totalWorkerNotices =
    workerNoticesFromRequests.length + workerNoticesFromComplaints.length;

  const filteredRequests = requests.filter((r) => {
    if (requestFilter === "all") return true;
    return r.status === requestFilter;
  });

  const sortedFilteredRequests = [...filteredRequests].sort((a, b) => {
    const priorityDiff = getPriorityRank(a) - getPriorityRank(b);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const sortedWorkerNoticesFromRequests = [...workerNoticesFromRequests].sort(
    (a, b) => {
      const priorityDiff = getPriorityRank(a) - getPriorityRank(b);

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    }
  );

  const filteredCitizenComplaints = citizenComplaints.filter((c) => {
    if (citizenComplaintFilter === "all") return true;
    return c.status === citizenComplaintFilter;
  });

  const filteredWorkerComplaints = workerComplaints.filter((c) => {
    if (workerComplaintFilter === "all") return true;
    return c.status === workerComplaintFilter;
  });

  const summary = analytics?.summary || {
    totalRequests: analytics?.totalRequests || 0,
    completedRequests: analytics?.completedRequests || 0,
    pendingRequests: analytics?.pendingRequests || 0,
    acceptedRequests: analytics?.acceptedRequests || 0,
    totalComplaints: analytics?.totalComplaints || 0,
    resolvedComplaints:
      analytics?.completedComplaints || analytics?.resolvedComplaints || 0,
  };

  const requestStatusData =
    analytics?.requestStatusData ||
    analytics?.statusData ||
    analytics?.charts?.requestStatusStats?.map((item) => ({
      name: item._id || item.name || "Unknown",
      count: item.count || item.value || 0,
    })) ||
    [];

  const wasteCategoryMeta = {
    "Household Garbage Pickup": {
      name: "Household Garbage",
      color: "#8b5cf6",
    },
    "Clean Roadside Fallen Leaves": {
      name: "Roadside Leaves",
      color: "#22c55e",
    },
    "Public Washroom Cleaning": {
      name: "Washroom Cleaning",
      color: "#f97316",
    },
    "Choked Drain": {
      name: "Choked Drain",
      color: "#3b82f6",
    },
    "Area Garbage Pickup": {
      name: "Area Garbage",
      color: "#ec4899",
    },
    "Gutter Overflow": {
      name: "Gutter Overflow",
      color: "#eab308",
    },
    Other: {
      name: "Other",
      color: "#14b8a6",
    },
  };

  const wasteTypeData =
    (
      analytics?.wasteTypeData ||
      analytics?.wasteDistributionData ||
      analytics?.collectedWasteDistribution ||
      analytics?.charts?.wasteTypeStats?.map((item) => ({
        name: item._id || item.name || item.category || "Unknown",
        count: item.count || item.value || 0,
      })) ||
      []
    )
      .filter((item) => (item.count || item.value || 0) > 0)
      .map((item) => {
        const originalName = item.category || item._id || item.name;
        const meta = wasteCategoryMeta[originalName] || wasteCategoryMeta[item.name];

        return {
          name: meta?.name || item.name || originalName || "Unknown",
          count: item.count || item.value || 0,
          color: item.color || meta?.color || "#64748b",
        };
      });

  const shortenAreaName = (name) => {
    if (!name) return "Unknown Area";

    const cleanName = String(name).trim().replace(/\s+/g, " ");

    if (cleanName.length > 18) {
      return cleanName.slice(0, 18) + "...";
    }

    return cleanName;
  };

  const areaData = (
    analytics?.charts?.areaStats ||
    analytics?.areaWiseData ||
    analytics?.areaData ||
    analytics?.areaWiseRequests ||
    []
  ).map((item) => {
    const fullName = item._id || item.name || item.area || "Unknown Area";

    return {
      name: shortenAreaName(fullName),
      fullName,
      count: item.count || item.value || 0,
    };
  });

  const dailyTrendData =
    analytics?.dailyRequestTrend ||
    analytics?.dailyTrendData ||
    analytics?.requestTrendData ||
    analytics?.charts?.dailyRequestTrend?.map((item) => ({
      date: item._id || item.date,
      requests: item.requests || item.count || 0,
    })) ||
    [];

  const buildDailyComplaintTrend = (raisedBy) => {
    const complaintMap = {};

    complaints
      .filter((complaint) => complaint.raisedBy === raisedBy)
      .forEach((complaint) => {
        const date = new Date(complaint.createdAt).toISOString().split("T")[0];

        if (!complaintMap[date]) {
          complaintMap[date] = {
            date,
            complaints: 0,
          };
        }

        complaintMap[date].complaints += 1;
      });

    return Object.values(complaintMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  const dailyCitizenComplaintTrendData =
    analytics?.dailyCitizenComplaintTrend ||
    analytics?.charts?.dailyCitizenComplaintTrend?.map((item) => ({
      date: item._id || item.date,
      complaints: item.complaints || item.count || 0,
    })) ||
    buildDailyComplaintTrend("citizen");

  const dailyWorkerComplaintTrendData =
    analytics?.dailyWorkerComplaintTrend ||
    analytics?.charts?.dailyWorkerComplaintTrend?.map((item) => ({
      date: item._id || item.date,
      complaints: item.complaints || item.count || 0,
    })) ||
    buildDailyComplaintTrend("worker");


  const getWasteSegregationCategory = (value = "") => {
    const text = String(value).toLowerCase();

    if (
      text.includes("wet") ||
      text.includes("organic") ||
      text.includes("food") ||
      text.includes("fruit") ||
      text.includes("vegetable")
    ) {
      return "Wet Waste";
    }

    if (
      text.includes("hazardous") ||
      text.includes("e-waste") ||
      text.includes("battery") ||
      text.includes("chemical") ||
      text.includes("medical") ||
      text.includes("syringe") ||
      text.includes("medicine")
    ) {
      return "Hazardous Waste";
    }

    if (
      text.includes("dry") ||
      text.includes("plastic") ||
      text.includes("paper") ||
      text.includes("cardboard") ||
      text.includes("metal") ||
      text.includes("glass")
    ) {
      return "Dry Waste";
    }

    return "";
  };

  const dryWetHazardousWasteData = [
    {
      name: "Dry Waste",
      count: requests.filter(
        (r) =>
          r.status === "completed" &&
          getWasteSegregationCategory(r.aiWasteType) === "Dry Waste"
      ).length,
    },
    {
      name: "Wet Waste",
      count: requests.filter(
        (r) =>
          r.status === "completed" &&
          getWasteSegregationCategory(r.aiWasteType) === "Wet Waste"
      ).length,
    },
    {
      name: "Hazardous Waste",
      count: requests.filter(
        (r) =>
          r.status === "completed" &&
          getWasteSegregationCategory(r.aiWasteType) === "Hazardous Waste"
      ).length,
    },
  ].filter((item) => item.count > 0);

  const navItems = [
    {
      id: "overview",
      label: "Dashboard",
      icon: "📊",
    },
    {
      id: "requests",
      label: "Citizen Requests",
      icon: "🗑️",
    },
    {
      id: "citizenComplaints",
      label: "Citizen Complaints",
      icon: "📢",
    },
    {
      id: "workerComplaints",
      label: "Worker Complaints",
      icon: "👷",
    },
    {
      id: "workerNotices",
      label: "Worker Notices",
      icon: "📨",
    },
  ];

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return {
        background: "rgba(239,68,68,0.18)",
        color: "#f87171",
        padding: "6px 12px",
        borderRadius: "999px",
        fontWeight: "900",
        display: "inline-block",
      };
    }

    return {
      background: "rgba(59,130,246,0.18)",
      color: "#60a5fa",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: "900",
      display: "inline-block",
    };
  };

  const getPageTitle = () => {
    if (activeSection === "overview") return "Dashboard Overview";
    if (activeSection === "requests") return "Citizen Requests";
    if (activeSection === "citizenComplaints") return "Citizen Complaints";
    if (activeSection === "workerComplaints") return "Worker Complaints";
    if (activeSection === "workerNotices") return "Worker Notices";
    return "Admin Dashboard";
  };

  const renderRequestCard = (r) => {
    const priority = getRequestPriority(r);
    const isCompleted = r.status === "completed";
    const isProblemResolved = r.problemResolved || isCompleted;

    return (
      <div key={r._id} style={styles.dataCard}>
        <div style={styles.cardTop}>
          <div>
            <h3 style={styles.itemTitle}>{r.category || "Waste Request"}</h3>
            <p style={styles.mutedText}>
              {new Date(r.createdAt).toLocaleString()}
            </p>
          </div>

          <span style={styles.statusBadge}>{r.status}</span>
        </div>

        <div style={styles.infoGrid}>
          <p>
            <b>Area:</b> {r.area || "N/A"}
          </p>

          <p>
            <b>Citizen:</b> {r.citizen?.fullName || r.citizen?.name || "N/A"}
          </p>

          <p>
            <b>Description:</b> {r.description || "No description"}
          </p>

          <p>
            <b>Priority:</b>{" "}
            <span style={getPriorityStyle(priority)}>
              {getPriorityLabel(priority)}
            </span>
          </p>

          <p>
            <b>AI Suggested Department:</b>{" "}
            {r.assignedDepartment || "General"}
          </p>

          {r.aiWasteType && (
            <p>
              <b>AI Waste Category:</b> {r.aiWasteType}
            </p>
          )}

          {r.aiConfidence > 0 && (
            <p>
              <b>AI Confidence:</b> {r.aiConfidence}%
            </p>
          )}

          {r.aiImagePrediction && (
            <p>
              <b>AI Detected Object:</b> {r.aiImagePrediction}
            </p>
          )}

          <p>
            <b>Reason:</b> {getPriorityReason(r)}
          </p>

          <p>
            <b>Accepted By:</b>{" "}
            {r.acceptedBy?.fullName ||
              r.acceptedBy?.name ||
              "No worker accepted yet"}
          </p>

          <p>
            <b>Notice Sent:</b>{" "}
            <span style={r.noticeSent ? styles.yesBadge : styles.noBadge}>
              {r.noticeSent ? "Yes" : "No"}
            </span>
          </p>

          <p>
            <b>Notice Accepted:</b>{" "}
            <span style={r.noticeAccepted ? styles.yesBadge : styles.noBadge}>
              {r.noticeAccepted ? "Yes" : "No"}
            </span>
          </p>

          <p>
            <b>Problem Resolved:</b>{" "}
            <span style={isProblemResolved ? styles.yesBadge : styles.noBadge}>
              {isProblemResolved ? "Yes" : "No"}
            </span>
          </p>
        </div>

        {priority === "High" && (
          <div style={styles.emergencyBox}>
            🚨 Emergency request. Handle this before normal requests.
          </div>
        )}

        {r.media && (
          <a
            style={styles.link}
            href={`${API_BASE}/uploads/${r.media}`}
            target="_blank"
            rel="noreferrer"
          >
            View Attachment
          </a>
        )}

        <div style={styles.actionRow}>
          {!isCompleted && !r.noticeSent && (
            <button
              style={styles.warningBtn}
              onClick={() => sendRequestNotice(r._id)}
            >
              Send Notice To Worker
            </button>
          )}

          {isCompleted && (
            <button style={styles.successBtn}>
              Request Completed by Worker
            </button>
          )}

          {!isCompleted && r.noticeSent && !r.noticeAccepted && (
            <button style={styles.disabledBtn}>
              Waiting for Worker to Accept Notice
            </button>
          )}

          {!isCompleted && r.noticeAccepted && !r.problemResolved && (
            <button style={styles.disabledBtn}>
              Notice Accepted - Waiting for Resolution
            </button>
          )}

          {r.problemResolved && (
            <button style={styles.successBtn}>
              Problem Resolved by Worker
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderCitizenComplaintCard = (c) => {
    return (
      <div key={c._id} style={styles.dataCard}>
        <div style={styles.cardTop}>
          <div>
            <h3 style={styles.itemTitle}>{c.category || "Citizen Complaint"}</h3>
            <p style={styles.mutedText}>
              {new Date(c.createdAt).toLocaleString()}
            </p>
          </div>

          <span style={styles.statusBadge}>{c.status}</span>
        </div>

        <div style={styles.infoGrid}>
          <p>
            <b>User:</b> {c.user?.fullName || c.user?.name || "N/A"}
          </p>

          <p>
            <b>Category:</b> {c.category || "Other"}
          </p>

          <p>
            <b>Message:</b> {c.message}
          </p>

          <p>
            <b>Accepted By:</b> {c.acceptedBy?.name || "Not accepted"}
          </p>

          <p>
            <b>Completed By:</b> {c.completedBy?.name || "Not completed"}
          </p>

          <p>
            <b>Notice Sent:</b>{" "}
            <span style={c.noticeSent ? styles.yesBadge : styles.noBadge}>
              {c.noticeSent ? "Yes" : "No"}
            </span>
          </p>
        </div>

        {c.media && (
          <a
            style={styles.link}
            href={`${API_BASE}/uploads/${c.media}`}
            target="_blank"
            rel="noreferrer"
          >
            View Attachment
          </a>
        )}

        <div style={styles.actionRow}>
          {c.status !== "completed" && !c.noticeSent && (
            <button
              style={styles.warningBtn}
              onClick={() => sendCitizenComplaintNotice(c._id)}
            >
              Send Notice To Worker
            </button>
          )}

          {c.noticeSent && c.status !== "completed" && (
            <button style={styles.disabledBtn}>
              Notice Sent - Waiting for Worker
            </button>
          )}

          {c.status === "completed" && (
            <button style={styles.successBtn}>Citizen Complaint Completed</button>
          )}
        </div>
      </div>
    );
  };

  const renderWorkerComplaintCard = (c) => {
    return (
      <div key={c._id} style={styles.dataCard}>
        <div style={styles.cardTop}>
          <div>
            <h3 style={styles.itemTitle}>Worker Complaint</h3>
            <p style={styles.mutedText}>
              {new Date(c.createdAt).toLocaleString()}
            </p>
          </div>

          <span style={styles.statusBadge}>{c.status}</span>
        </div>

        <div style={styles.infoGrid}>
          <p>
            <b>Worker:</b> {c.user?.name || "N/A"}
          </p>

          <p>
            <b>Message:</b> {c.message}
          </p>

          <p>
            <b>Accepted By:</b> {c.acceptedBy?.name || "Not accepted"}
          </p>

          <p>
            <b>Completed By:</b> {c.completedBy?.name || "Not completed"}
          </p>
        </div>

        {c.media && (
          <a
            style={styles.link}
            href={`${API_BASE}/uploads/${c.media}`}
            target="_blank"
            rel="noreferrer"
          >
            View Attachment
          </a>
        )}

        <div style={styles.actionRow}>
          {c.status === "pending" && (
            <button
              style={styles.primaryBtn}
              onClick={() => adminAcceptWorkerComplaint(c._id)}
            >
              Accept Worker Complaint
            </button>
          )}

          {c.status === "accepted" && (
            <button
              style={styles.successBtn}
              onClick={() => adminCompleteWorkerComplaint(c._id)}
            >
              Mark Worker Complaint Completed
            </button>
          )}

          {c.status === "completed" && (
            <button style={styles.successBtn}>Worker Complaint Completed</button>
          )}
        </div>
      </div>
    );
  };

  const renderOverview = () => {
    return (
      <>
        <div style={styles.analyticsPanel}>
          <div style={styles.analyticsHeader}>
            <div>
              <h2 style={styles.sectionTitle}>System Analytics</h2>
              <p style={styles.subText}>
                Monitor requests, complaints, notices and generate CSV reports.
              </p>
            </div>

            <div style={styles.reportControls}>
              <select
                style={styles.selectSmall}
                value={reportRange}
                onChange={(e) => setReportRange(e.target.value)}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Timeline</option>
              </select>

              {reportRange === "custom" && (
                <>
                  <input
                    style={styles.dateInput}
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />

                  <input
                    style={styles.dateInput}
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />

                  <button style={styles.applyBtn} onClick={fetchAnalytics}>
                    Apply
                  </button>
                </>
              )}

              <button style={styles.csvBtn} onClick={downloadCSVReport}>
                {reportLoading ? "Downloading..." : "Download CSV"}
              </button>
            </div>
          </div>

          {analyticsLoading && <p style={styles.subText}>Loading analytics...</p>}

          {summary && (
            <div style={styles.analyticsStats}>
              <div style={styles.metricCard}>
                <span style={styles.metricIcon}>🗑️</span>
                <h3>Total Requests</h3>
                <p>{summary.totalRequests}</p>
              </div>

              <div style={styles.metricCard}>
                <span style={styles.metricIcon}>✅</span>
                <h3>Completed</h3>
                <p>{summary.completedRequests}</p>
              </div>

              <div style={styles.metricCard}>
                <span style={styles.metricIcon}>⏳</span>
                <h3>Pending</h3>
                <p>{summary.pendingRequests}</p>
              </div>

              <div style={styles.metricCard}>
                <span style={styles.metricIcon}>📌</span>
                <h3>Accepted</h3>
                <p>{summary.acceptedRequests}</p>
              </div>

              <div style={styles.metricCard}>
                <span style={styles.metricIcon}>📢</span>
                <h3>Complaints</h3>
                <p>{summary.totalComplaints}</p>
              </div>

              <div style={styles.metricCard}>
                <span style={styles.metricIcon}>🛠️</span>
                <h3>Resolved</h3>
                <p>{summary.resolvedComplaints}</p>
              </div>
            </div>
          )}

          <div style={styles.chartsGrid}>
            <div style={styles.chartBox}>
              <h3>Daily Request Trend</h3>

              {dailyTrendData.length === 0 ? (
                <p style={styles.subText}>No data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={dailyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="date"
                      stroke={isDarkMode ? "#cbd5e1" : "#475569"}
                    />
                    <YAxis
                      allowDecimals={false}
                      stroke={isDarkMode ? "#cbd5e1" : "#475569"}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div style={styles.chartBox}>
              <h3>Request Status</h3>

              {requestStatusData.length === 0 ? (
                <p style={styles.subText}>No data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={requestStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="name"
                      stroke={isDarkMode ? "#cbd5e1" : "#475569"}
                    />
                    <YAxis
                      allowDecimals={false}
                      stroke={isDarkMode ? "#cbd5e1" : "#475569"}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div style={styles.chartBox}>
              <h3>Collected Waste Distribution</h3>

              {wasteTypeData.length === 0 ? (
                <p style={styles.subText}>No completed waste collection data available</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={wasteTypeData}
                        dataKey="count"
                        nameKey="name"
                        outerRadius={95}
                        label={({ name, count }) => `${name}: ${count}`}
                      >
                        {wasteTypeData.map((item, index) => (
                          <Cell key={index} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div style={styles.pieLegend}>
                    {wasteTypeData.map((item) => (
                      <div key={item.name} style={styles.legendItem}>
                        <span
                          style={{
                            ...styles.legendColor,
                            background: item.color,
                          }}
                        ></span>
                        <span>
                          {item.name}: <b>{item.count}</b>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>


            <div style={styles.chartBox}>
              <h3>Dry / Wet / Hazardous Waste Collected</h3>

              {dryWetHazardousWasteData.length === 0 ? (
                <p style={styles.subText}>
                  No AI-classified completed household waste data available
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dryWetHazardousWasteData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="name"
                      stroke={isDarkMode ? "#cbd5e1" : "#475569"}
                    />
                    <YAxis
                      allowDecimals={false}
                      stroke={isDarkMode ? "#cbd5e1" : "#475569"}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#22c55e"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div
              style={{
                ...styles.chartBox,
                minHeight: Math.max(360, areaData.length * 70),
              }}
            >
              <h3>Area-wise Requests</h3>

              {areaData.length === 0 ? (
                <p style={styles.subText}>No data available</p>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(280, areaData.length * 60)}
                >
                  <BarChart
                    data={areaData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

                    <XAxis
                      type="number"
                      allowDecimals={false}
                      stroke={isDarkMode ? "#cbd5e1" : "#475569"}
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      interval={0}
                      stroke={isDarkMode ? "#cbd5e1" : "#475569"}
                      tick={{ fontSize: 12 }}
                    />

                    <Tooltip
                      formatter={(value) => [`${value} requests`, "Count"]}
                      labelFormatter={(label, payload) =>
                        payload?.[0]?.payload?.fullName || label
                      }
                    />

                    <Bar
                      dataKey="count"
                      fill="#22c55e"
                      radius={[0, 8, 8, 0]}
                      barSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div style={styles.chartBox}>
              <h3>Daily Citizen Complaint Trend</h3>

              {dailyCitizenComplaintTrendData.length === 0 ? (
                <p style={styles.subText}>No citizen complaint data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={dailyCitizenComplaintTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

                    <XAxis
                      dataKey="date"
                      stroke={isDarkMode ? "#cbd5e1" : "#475569"}
                    />

                    <YAxis
                      allowDecimals={false}
                      stroke={isDarkMode ? "#cbd5e1" : "#475569"}
                    />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="complaints"
                      stroke="#f97316"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div style={styles.chartBox}>
              <h3>Daily Worker Complaint Trend</h3>

              {dailyWorkerComplaintTrendData.length === 0 ? (
                <p style={styles.subText}>No worker complaint data available</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={dailyWorkerComplaintTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

                    <XAxis
                      dataKey="date"
                      stroke={isDarkMode ? "#cbd5e1" : "#475569"}
                    />

                    <YAxis
                      allowDecimals={false}
                      stroke={isDarkMode ? "#cbd5e1" : "#475569"}
                    />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="complaints"
                      stroke="#ec4899"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div style={styles.quickGrid}>
          <div
            style={styles.quickCard}
            onClick={() => setActiveSection("requests")}
          >
            <span style={styles.quickIcon}>🗑️</span>
            <h3>Citizen Requests</h3>
            <p>{requests.length} total requests</p>
            <button style={styles.openBtn}>Open</button>
          </div>

          <div
            style={styles.quickCard}
            onClick={() => setActiveSection("citizenComplaints")}
          >
            <span style={styles.quickIcon}>📢</span>
            <h3>Citizen Complaints</h3>
            <p>{citizenComplaints.length} total complaints</p>
            <button style={styles.openBtn}>Open</button>
          </div>

          <div
            style={styles.quickCard}
            onClick={() => setActiveSection("workerComplaints")}
          >
            <span style={styles.quickIcon}>👷</span>
            <h3>Worker Complaints</h3>
            <p>{workerComplaints.length} total complaints</p>
            <button style={styles.openBtn}>Open</button>
          </div>

          <div
            style={styles.quickCard}
            onClick={() => setActiveSection("workerNotices")}
          >
            <span style={styles.quickIcon}>📨</span>
            <h3>Notices for Worker</h3>
            <p>{totalWorkerNotices} notices sent</p>
            <button style={styles.openBtn}>Open</button>
          </div>
        </div>
      </>
    );
  };

  const renderRequests = () => {
    return (
      <div style={styles.contentPanel}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Citizen Requests</h2>
            <p style={styles.subText}>View and manage all pickup requests.</p>
          </div>

          <select
            style={styles.selectSmall}
            value={requestFilter}
            onChange={(e) => setRequestFilter(e.target.value)}
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending Requests</option>
            <option value="accepted">Accepted Requests</option>
            <option value="completed">Completed Requests</option>
          </select>
        </div>

        {sortedFilteredRequests.length === 0 ? (
          <p style={styles.emptyText}>No requests found</p>
        ) : (
          sortedFilteredRequests.map(renderRequestCard)
        )}
      </div>
    );
  };

  const renderCitizenComplaints = () => {
    return (
      <div style={styles.contentPanel}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Citizen Complaints</h2>
            <p style={styles.subText}>Complaints submitted by citizens.</p>
          </div>

          <select
            style={styles.selectSmall}
            value={citizenComplaintFilter}
            onChange={(e) => setCitizenComplaintFilter(e.target.value)}
          >
            <option value="all">All Citizen Complaints</option>
            <option value="pending">Pending Citizen Complaints</option>
            <option value="accepted">Accepted Citizen Complaints</option>
            <option value="completed">Completed Citizen Complaints</option>
          </select>
        </div>

        {filteredCitizenComplaints.length === 0 ? (
          <p style={styles.emptyText}>No citizen complaints found</p>
        ) : (
          filteredCitizenComplaints.map(renderCitizenComplaintCard)
        )}
      </div>
    );
  };

  const renderWorkerComplaints = () => {
    return (
      <div style={styles.contentPanel}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Worker Complaints</h2>
            <p style={styles.subText}>Complaints raised by workers.</p>
          </div>

          <select
            style={styles.selectSmall}
            value={workerComplaintFilter}
            onChange={(e) => setWorkerComplaintFilter(e.target.value)}
          >
            <option value="all">All Worker Complaints</option>
            <option value="pending">Pending Worker Complaints</option>
            <option value="accepted">Accepted Worker Complaints</option>
            <option value="completed">Completed Worker Complaints</option>
          </select>
        </div>

        {filteredWorkerComplaints.length === 0 ? (
          <p style={styles.emptyText}>No worker complaints found</p>
        ) : (
          filteredWorkerComplaints.map(renderWorkerComplaintCard)
        )}
      </div>
    );
  };

  const renderWorkerNotices = () => {
    return (
      <div style={styles.contentPanel}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Notices for Worker</h2>
            <p style={styles.subText}>All notices sent by admin to workers.</p>
          </div>
        </div>

        <h3 style={styles.noticeGroupTitle}>Request Notices</h3>

        {sortedWorkerNoticesFromRequests.length === 0 ? (
          <p style={styles.emptyText}>No request notices sent</p>
        ) : (
          sortedWorkerNoticesFromRequests.map((r) => (
            <div key={r._id} style={styles.dataCard}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.itemTitle}>
                    {r.category || "Request Notice"}
                  </h3>
                  <p style={styles.mutedText}>
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>

                <span style={styles.noticeBadge}>Notice Sent</span>
              </div>

              <div style={styles.infoGrid}>
                <p>
                  <b>Area:</b> {r.area || "N/A"}
                </p>

                <p>
                  <b>Priority:</b>{" "}
                  <span style={getPriorityStyle(getRequestPriority(r))}>
                    {getPriorityLabel(getRequestPriority(r))}
                  </span>
                </p>

                <p>
                  <b>Citizen:</b> {r.citizen?.fullName || r.citizen?.name || "N/A"}
                </p>

                <p>
                  <b>Worker:</b> {r.acceptedBy?.name || "Not accepted yet"}
                </p>

                <p>
                  <b>Notice Accepted:</b>{" "}
                  <span
                    style={r.noticeAccepted ? styles.yesBadge : styles.noBadge}
                  >
                    {r.noticeAccepted ? "Yes" : "No"}
                  </span>
                </p>

                <p>
                  <b>Problem Resolved:</b>{" "}
                  <span
                    style={r.problemResolved ? styles.yesBadge : styles.noBadge}
                  >
                    {r.problemResolved ? "Yes" : "No"}
                  </span>
                </p>
              </div>
            </div>
          ))
        )}

        <h3 style={styles.noticeGroupTitle}>Citizen Complaint Notices</h3>

        {workerNoticesFromComplaints.length === 0 ? (
          <p style={styles.emptyText}>No complaint notices sent</p>
        ) : (
          workerNoticesFromComplaints.map((c) => (
            <div key={c._id} style={styles.dataCard}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.itemTitle}>Citizen Complaint Notice</h3>
                  <p style={styles.mutedText}>
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>

                <span style={styles.noticeBadge}>Notice Sent</span>
              </div>

              <div style={styles.infoGrid}>
                <p>
                  <b>User:</b> {c.user?.name || "N/A"}
                </p>

                <p>
                  <b>Message:</b> {c.message}
                </p>

                <p>
                  <b>Accepted By:</b> {c.acceptedBy?.name || "Not accepted"}
                </p>

                <p>
                  <b>Status:</b> {c.status}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div style={styles.appShell}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brandBox}>
            <div style={styles.logoCircle}>SW</div>
            <div>
              <h2 style={styles.brandTitle}>Smart Waste</h2>
              <p style={styles.brandSub}>Admin Panel</p>
            </div>
          </div>

          <div style={styles.profileCard}>
            <div style={styles.avatar}>
              {adminName?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div>
              <h3 style={styles.profileName}>{adminName}</h3>
              <p style={styles.profileEmail}>{adminEmail}</p>
              <span style={styles.roleBadge}>Administrator</span>
            </div>
          </div>

          <nav style={styles.navList}>
            {navItems.map((item) => (
              <button
                key={item.id}
                style={
                  activeSection === item.id
                    ? styles.activeNavButton
                    : styles.navButton
                }
                onClick={() => setActiveSection(item.id)}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div style={styles.sidebarBottom}>
          <button
            style={styles.themeBtn}
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main style={styles.mainContent}>
        <header style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>{getPageTitle()}</h1>
            <p style={styles.pageSubTitle}>
              Smart Waste Management System Control Center
            </p>
          </div>

          <div style={styles.topActions}>
            <button
              style={styles.refreshBtn}
              onClick={() => {
                fetchData();
                fetchAnalytics();
              }}
            >
              Refresh
            </button>
          </div>
        </header>

        {activeSection === "overview" && renderOverview()}
        {activeSection === "requests" && renderRequests()}
        {activeSection === "citizenComplaints" && renderCitizenComplaints()}
        {activeSection === "workerComplaints" && renderWorkerComplaints()}
        {activeSection === "workerNotices" && renderWorkerNotices()}
      </main>
    </div>
  );
}

function commonStyles(isDarkMode) {
  const bg = isDarkMode ? "#020617" : "#f1f5f9";
  const sidebarBg = isDarkMode ? "#0f172a" : "#ffffff";
  const cardBg = isDarkMode ? "#111827" : "#ffffff";
  const cardBg2 = isDarkMode ? "#1e293b" : "#f8fafc";
  const text = isDarkMode ? "#f8fafc" : "#0f172a";
  const muted = isDarkMode ? "#94a3b8" : "#64748b";
  const border = isDarkMode ? "#334155" : "#e2e8f0";

  return {
    appShell: {
      minHeight: "100vh",
      display: "flex",
      background: bg,
      color: text,
      fontFamily:
        "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    sidebar: {
      width: "290px",
      background: sidebarBg,
      borderRight: `1px solid ${border}`,
      padding: "22px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      height: "100vh",
      boxSizing: "border-box",
    },

    brandBox: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "25px",
    },

    logoCircle: {
      width: "48px",
      height: "48px",
      borderRadius: "16px",
      background: "linear-gradient(135deg, #22c55e, #3b82f6, #8b5cf6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: "900",
      letterSpacing: "1px",
      boxShadow: "0 12px 25px rgba(59,130,246,0.35)",
    },

    brandTitle: {
      margin: 0,
      fontSize: "20px",
      color: text,
    },

    brandSub: {
      margin: 0,
      color: muted,
      fontSize: "13px",
    },

    profileCard: {
      background: isDarkMode
        ? "linear-gradient(135deg, #1e293b, #0f172a)"
        : "linear-gradient(135deg, #eff6ff, #f8fafc)",
      border: `1px solid ${border}`,
      padding: "16px",
      borderRadius: "22px",
      display: "flex",
      gap: "12px",
      alignItems: "center",
      marginBottom: "25px",
    },

    avatar: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: "bold",
      fontSize: "20px",
      flexShrink: 0,
    },

    profileName: {
      margin: "0 0 4px 0",
      fontSize: "15px",
      color: text,
    },

    profileEmail: {
      margin: "0 0 8px 0",
      fontSize: "12px",
      color: muted,
      wordBreak: "break-word",
    },

    roleBadge: {
      background: "rgba(34,197,94,0.15)",
      color: "#22c55e",
      padding: "4px 9px",
      borderRadius: "999px",
      fontSize: "11px",
      fontWeight: "700",
    },

    navList: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },

    navButton: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "13px 14px",
      borderRadius: "14px",
      border: "none",
      background: "transparent",
      color: muted,
      cursor: "pointer",
      textAlign: "left",
      fontSize: "15px",
      fontWeight: "600",
    },

    activeNavButton: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "13px 14px",
      borderRadius: "14px",
      border: "none",
      background: "linear-gradient(135deg, #2563eb, #7c3aed)",
      color: "white",
      cursor: "pointer",
      textAlign: "left",
      fontSize: "15px",
      fontWeight: "700",
      boxShadow: "0 12px 22px rgba(37,99,235,0.28)",
    },

    sidebarBottom: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },

    themeBtn: {
      padding: "12px",
      borderRadius: "14px",
      border: `1px solid ${border}`,
      background: cardBg2,
      color: text,
      cursor: "pointer",
      fontWeight: "700",
    },

    logoutBtn: {
      padding: "12px",
      borderRadius: "14px",
      border: "none",
      background: "#ef4444",
      color: "white",
      cursor: "pointer",
      fontWeight: "800",
    },

    mainContent: {
      flex: 1,
      padding: "26px",
      overflowX: "hidden",
    },

    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
      gap: "16px",
      flexWrap: "wrap",
    },

    pageTitle: {
      margin: 0,
      fontSize: "30px",
      color: text,
    },

    pageSubTitle: {
      margin: "6px 0 0 0",
      color: muted,
    },

    topActions: {
      display: "flex",
      gap: "10px",
    },

    refreshBtn: {
      padding: "11px 16px",
      borderRadius: "14px",
      border: `1px solid ${border}`,
      background: cardBg,
      color: text,
      cursor: "pointer",
      fontWeight: "700",
    },

    analyticsPanel: {
      background: cardBg,
      border: `1px solid ${border}`,
      borderRadius: "26px",
      padding: "22px",
      marginBottom: "24px",
      boxShadow: isDarkMode
        ? "0 20px 40px rgba(0,0,0,0.35)"
        : "0 20px 40px rgba(15,23,42,0.08)",
    },

    analyticsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "20px",
      flexWrap: "wrap",
      marginBottom: "22px",
    },

    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "16px",
      flexWrap: "wrap",
      marginBottom: "18px",
    },

    sectionTitle: {
      margin: 0,
      color: text,
      fontSize: "22px",
    },

    subText: {
      margin: "7px 0 0 0",
      color: muted,
      fontSize: "14px",
    },

    reportControls: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      alignItems: "center",
    },

    selectSmall: {
      padding: "11px",
      borderRadius: "12px",
      border: `1px solid ${border}`,
      background: cardBg2,
      color: text,
      minWidth: "160px",
      outline: "none",
    },

    dateInput: {
      padding: "10px",
      borderRadius: "12px",
      border: `1px solid ${border}`,
      background: cardBg2,
      color: text,
      outline: "none",
    },

    applyBtn: {
      padding: "10px 16px",
      border: "none",
      borderRadius: "12px",
      background: "#2563eb",
      color: "white",
      cursor: "pointer",
      fontWeight: "bold",
    },

    csvBtn: {
      padding: "10px 16px",
      border: "none",
      borderRadius: "12px",
      background: "#16a34a",
      color: "white",
      cursor: "pointer",
      fontWeight: "bold",
    },

    analyticsStats: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
      gap: "15px",
      marginBottom: "24px",
    },

    metricCard: {
      background: cardBg2,
      border: `1px solid ${border}`,
      padding: "18px",
      borderRadius: "20px",
      boxShadow: isDarkMode
        ? "0 12px 25px rgba(0,0,0,0.18)"
        : "0 12px 25px rgba(15,23,42,0.06)",
    },

    metricIcon: {
      fontSize: "24px",
    },

    chartsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
      gap: "18px",
    },

    chartBox: {
      background: cardBg2,
      border: `1px solid ${border}`,
      padding: "18px",
      borderRadius: "20px",
      minHeight: "360px",
    },

    pieLegend: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "10px",
      marginTop: "15px",
    },

    legendItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: text,
      fontSize: "13px",
    },

    legendColor: {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      display: "inline-block",
      flexShrink: 0,
    },

    quickGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
      gap: "18px",
    },

    quickCard: {
      background: cardBg,
      border: `1px solid ${border}`,
      borderRadius: "24px",
      padding: "22px",
      cursor: "pointer",
      boxShadow: isDarkMode
        ? "0 20px 35px rgba(0,0,0,0.25)"
        : "0 20px 35px rgba(15,23,42,0.08)",
      transition: "0.2s ease",
    },

    quickIcon: {
      fontSize: "34px",
    },

    openBtn: {
      marginTop: "10px",
      padding: "9px 15px",
      borderRadius: "12px",
      border: "none",
      background: "linear-gradient(135deg, #2563eb, #7c3aed)",
      color: "white",
      fontWeight: "800",
      cursor: "pointer",
    },

    contentPanel: {
      background: cardBg,
      border: `1px solid ${border}`,
      borderRadius: "26px",
      padding: "22px",
      boxShadow: isDarkMode
        ? "0 20px 40px rgba(0,0,0,0.35)"
        : "0 20px 40px rgba(15,23,42,0.08)",
    },

    dataCard: {
      background: cardBg2,
      border: `1px solid ${border}`,
      borderRadius: "20px",
      padding: "18px",
      marginBottom: "16px",
    },

    cardTop: {
      display: "flex",
      justifyContent: "space-between",
      gap: "12px",
      alignItems: "flex-start",
      marginBottom: "12px",
    },

    itemTitle: {
      margin: 0,
      color: text,
      fontSize: "18px",
    },

    mutedText: {
      margin: "5px 0 0 0",
      color: muted,
      fontSize: "13px",
    },

    infoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "8px 18px",
      color: text,
    },

    statusBadge: {
      background: "rgba(139,92,246,0.16)",
      color: "#a78bfa",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: "800",
      fontSize: "12px",
      textTransform: "capitalize",
    },

    emergencyBox: {
      background: "rgba(239,68,68,0.16)",
      border: "1px solid rgba(239,68,68,0.45)",
      color: "#f87171",
      padding: "12px",
      borderRadius: "14px",
      marginTop: "12px",
      fontWeight: "900",
    },

    noticeBadge: {
      background: "rgba(249,115,22,0.16)",
      color: "#fb923c",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: "800",
      fontSize: "12px",
    },

    yesBadge: {
      background: "rgba(34,197,94,0.16)",
      color: "#22c55e",
      padding: "4px 10px",
      borderRadius: "999px",
      fontWeight: "bold",
    },

    noBadge: {
      background: "rgba(239,68,68,0.16)",
      color: "#ef4444",
      padding: "4px 10px",
      borderRadius: "999px",
      fontWeight: "bold",
    },

    link: {
      display: "inline-block",
      marginTop: "10px",
      color: "#60a5fa",
      fontWeight: "700",
      textDecoration: "none",
    },

    actionRow: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginTop: "14px",
    },

    primaryBtn: {
      padding: "10px 16px",
      border: "none",
      borderRadius: "12px",
      background: "#2563eb",
      color: "white",
      cursor: "pointer",
      fontWeight: "bold",
    },

    warningBtn: {
      padding: "10px 16px",
      border: "none",
      borderRadius: "12px",
      background: "#f97316",
      color: "white",
      cursor: "pointer",
      fontWeight: "bold",
    },

    successBtn: {
      padding: "10px 16px",
      border: "none",
      borderRadius: "12px",
      background: "#16a34a",
      color: "white",
      cursor: "pointer",
      fontWeight: "bold",
    },

    disabledBtn: {
      padding: "10px 16px",
      border: "none",
      borderRadius: "12px",
      background: "#64748b",
      color: "white",
      fontWeight: "bold",
    },

    emptyText: {
      color: muted,
      background: cardBg2,
      border: `1px dashed ${border}`,
      padding: "18px",
      borderRadius: "16px",
    },

    noticeGroupTitle: {
      marginTop: "20px",
      color: text,
    },
  };
}

export default AdminDashboard;