import { useEffect, useState } from "react";
import axios from "axios";

function WorkerDashboard() {
  const styles = commonStyles();

  const API_BASE = "http://localhost:5000";
  const token = sessionStorage.getItem("token") || sessionStorage.getItem("token");

  const [activeSection, setActiveSection] = useState("overview");
  const [worker, setWorker] = useState(null);

  const [requests, setRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);

  const [requestFilter, setRequestFilter] = useState("all");
  const [complaintFilter, setComplaintFilter] = useState("all");
  const [myComplaintFilter, setMyComplaintFilter] = useState("all");

  const [loading, setLoading] = useState(false);

  const [workerComplaint, setWorkerComplaint] = useState("");
  const [workerComplaintMedia, setWorkerComplaintMedia] = useState(null);

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  const fetchWorkerProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/workers/profile`, {
        headers: getHeaders(),
      });

      setWorker(res.data);
    } catch (err) {
      console.log("Worker profile error:", err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/workers/requests`, {
        headers: getHeaders(),
      });

      setRequests(res.data);
    } catch (err) {
      console.log("Worker requests error:", err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/workers/complaints`, {
        headers: getHeaders(),
      });

      setComplaints(res.data);
    } catch (err) {
      console.log("Worker complaints error:", err);
    }
  };

  const fetchMyComplaints = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/complaints/my`, {
        headers: getHeaders(),
      });

      const workerOwnComplaints = res.data.filter(
        (complaint) => complaint.raisedBy === "worker"
      );

      setMyComplaints(workerOwnComplaints);
    } catch (err) {
      console.log("My worker complaints error:", err);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await fetchWorkerProfile();
      await fetchRequests();
      await fetchComplaints();
      await fetchMyComplaints();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  const acceptRequest = async (id) => {
    try {
      await axios.put(
        `${API_BASE}/api/workers/requests/${id}/accept`,
        {},
        { headers: getHeaders() }
      );

      alert("Request accepted successfully");
      fetchAllData();
      fetchMyComplaints();
    } catch (err) {
      alert(err.response?.data?.msg || "Accept failed");
    }
  };

  const completeRequest = async (id) => {
    try {
      await axios.put(
        `${API_BASE}/api/workers/requests/${id}/complete`,
        {},
        { headers: getHeaders() }
      );

      alert("Request marked as completed");
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.msg || "Complete failed");
    }
  };

  const acceptNotice = async (id) => {
    try {
      await axios.put(
        `${API_BASE}/api/workers/requests/${id}/accept-notice`,
        {},
        { headers: getHeaders() }
      );

      alert("Notice accepted successfully");
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.msg || "Notice accept failed");
    }
  };

  const resolveProblem = async (id) => {
    try {
      await axios.put(
        `${API_BASE}/api/workers/requests/${id}/resolve-problem`,
        {},
        { headers: getHeaders() }
      );

      alert("Problem resolved successfully");
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.msg || "Resolve failed");
    }
  };

  const acceptComplaint = async (id) => {
    try {
      await axios.put(
        `${API_BASE}/api/workers/complaints/${id}/accept`,
        {},
        { headers: getHeaders() }
      );

      alert("Complaint accepted successfully");
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.msg || "Complaint accept failed");
    }
  };

  const completeComplaint = async (id) => {
    try {
      await axios.put(
        `${API_BASE}/api/workers/complaints/${id}/complete`,
        {},
        { headers: getHeaders() }
      );

      alert("Complaint completed successfully");
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.msg || "Complaint complete failed");
    }
  };

  const submitWorkerComplaint = async () => {
    if (!workerComplaint.trim()) {
      alert("Please enter complaint message");
      return;
    }

    const data = new FormData();

    data.append("message", workerComplaint);
    data.append("category", "Other");

    if (workerComplaintMedia) {
      data.append("media", workerComplaintMedia);
    }

    try {
      await axios.post(`${API_BASE}/api/complaints`, data, {
        headers: getHeaders(),
      });

      alert("Complaint submitted to admin successfully");

      setWorkerComplaint("");
      setWorkerComplaintMedia(null);

      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.msg || "Worker complaint failed");
    }
  };

  const openMapRoute = (item) => {
    let lat = null;
    let lng = null;

    if (item.location?.coordinates?.length === 2) {
      lng = item.location.coordinates[0];
      lat = item.location.coordinates[1];
    } else if (item.latitude && item.longitude) {
      lat = item.latitude;
      lng = item.longitude;
    }

    if (!lat || !lng) {
      alert("Location not available for this item");
      return;
    }

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  };

  const logout = () => {
    sessionStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const getRequestPriority = (request) => {
    const category = String(request.category || "").trim().toLowerCase();

    if (category === "gutter overflow" || category === "choked drain") {
      return "High";
    }

    return "Medium";
  };

  const getPriorityLabel = (priority) => {
    if (priority === "High") return "High Priority";
    return "Medium Priority";
  };

  const getPriorityRank = (request) => {
    const priority = getRequestPriority(request);
    return priority === "High" ? 0 : 1;
  };

  const filteredRequests = requests.filter((request) => {
    if (requestFilter === "all") return true;
    if (requestFilter === "notice") return request.noticeSent === true;
    return request.status === requestFilter;
  });

  const sortedFilteredRequests = [...filteredRequests].sort((a, b) => {
    const priorityDiff = getPriorityRank(a) - getPriorityRank(b);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const filteredComplaints = complaints.filter((complaint) => {
    if (complaintFilter === "all") return true;
    return complaint.status === complaintFilter;
  });

  const filteredMyComplaints = myComplaints.filter((complaint) => {
    if (myComplaintFilter === "all") return true;
    return complaint.status === myComplaintFilter;
  });

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const acceptedRequests = requests.filter((r) => r.status === "accepted");
  const completedRequests = requests.filter((r) => r.status === "completed");
  const noticeRequests = requests.filter((r) => r.noticeSent === true);

  const pendingComplaints = complaints.filter((c) => c.status === "pending");
  const acceptedComplaints = complaints.filter((c) => c.status === "accepted");
  const completedComplaints = complaints.filter((c) => c.status === "completed");

  const pendingMyComplaints = myComplaints.filter((c) => c.status === "pending");
  const acceptedMyComplaints = myComplaints.filter((c) => c.status === "accepted");
  const completedMyComplaints = myComplaints.filter((c) => c.status === "completed");

  const navItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "requests", label: "Service Requests", icon: "🗑️" },
    { id: "notices", label: "Admin Notices", icon: "🚨" },
    { id: "complaints", label: "Complaints", icon: "📢" },
    { id: "raiseComplaint", label: "Raise Complaint", icon: "📝" },
    { id: "myComplaints", label: "My Complaints", icon: "📋" },
  ];

  const getStatusStyle = (status) => {
    if (status === "pending") return styles.pendingBadge;
    if (status === "accepted") return styles.acceptedBadge;
    if (status === "completed") return styles.completedBadge;
    return styles.pendingBadge;
  };

  const getCitizenName = (item) => {
    return (
      item.citizen?.fullName ||
      item.citizen?.name ||
      item.user?.fullName ||
      item.user?.name ||
      "Citizen"
    );
  };

  const getCitizenPhone = (item) => {
    return item.citizen?.phone || item.user?.phone || "Not available";
  };

  const getCitizenAddress = (item) => {
    return (
      item.citizen?.address ||
      item.user?.address ||
      item.location?.address ||
      item.area ||
      "Not available"
    );
  };

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

  const renderOverview = () => (
    <>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>🗑️</span>
          <p>Total Requests</p>
          <h2>{requests.length}</h2>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statIcon}>⏳</span>
          <p>Pending Requests</p>
          <h2>{pendingRequests.length}</h2>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statIcon}>🛠️</span>
          <p>Accepted Requests</p>
          <h2>{acceptedRequests.length}</h2>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statIcon}>✅</span>
          <p>Completed Requests</p>
          <h2>{completedRequests.length}</h2>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statIcon}>🚨</span>
          <p>Admin Notices</p>
          <h2>{noticeRequests.length}</h2>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statIcon}>📢</span>
          <p>Complaints</p>
          <h2>{complaints.length}</h2>
        </div>
      </div>

      <div style={styles.quickGrid}>
        <div style={styles.quickCard} onClick={() => setActiveSection("requests")}>
          <h3>View Service Requests</h3>
          <p>Accept and complete waste collection or cleaning requests.</p>
          <button style={styles.primaryBtn}>Open Requests</button>
        </div>

        <div style={styles.quickCard} onClick={() => setActiveSection("notices")}>
          <h3>Admin Notices</h3>
          <p>View urgent tasks assigned through admin notices.</p>
          <button style={styles.warningBtn}>Open Notices</button>
        </div>

        <div
          style={styles.quickCard}
          onClick={() => setActiveSection("complaints")}
        >
          <h3>Citizen Complaints</h3>
          <p>Accept and resolve complaints sent by admin.</p>
          <button style={styles.successBtn}>Open Complaints</button>
        </div>

        <div
          style={styles.quickCard}
          onClick={() => setActiveSection("raiseComplaint")}
        >
          <h3>Raise Complaint to Admin</h3>
          <p>Report your issue to the admin with optional attachment.</p>
          <button style={styles.primaryBtn}>Raise Complaint</button>
        </div>

        <div
          style={styles.quickCard}
          onClick={() => setActiveSection("myComplaints")}
        >
          <h3>View My Complaint History</h3>
          <p>
            Track complaints raised by you. Pending: {pendingMyComplaints.length},
            Accepted: {acceptedMyComplaints.length}, Completed:{" "}
            {completedMyComplaints.length}
          </p>
          <button style={styles.successBtn}>Open History</button>
        </div>
      </div>
    </>
  );

  const renderRequestCard = (request) => {
    const priority = getRequestPriority(request);

    return (
      <div key={request._id} style={styles.taskCard}>
        <div style={styles.cardTop}>
          <div>
            <h3>{request.category}</h3>
            <p style={styles.mutedText}>
              {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>

          <span style={getStatusStyle(request.status)}>{request.status}</span>
        </div>

        <div style={styles.infoGrid}>
          <p style={styles.areaBox}>
            <strong>Area:</strong> {request.area || "Not provided"}
          </p>

          <p style={styles.phoneBox}>
            <strong>Phone:</strong> {getCitizenPhone(request)}
          </p>

          <p style={styles.priorityBox}>
            <strong>Priority:</strong>{" "}
            <span style={getPriorityStyle(priority)}>
              {getPriorityLabel(priority)}
            </span>
          </p>

          <p style={styles.aiSuggestedDepartment}>
            <strong>AI Suggested Department:</strong>{" "}
            {(() => {
              const category = request.category?.toLowerCase() || "";

              if (
                category.includes("household garbage") ||
                category.includes("garbage pickup") ||
                category.includes("fallen leaves") ||
                category.includes("area garbage")
              ) {
                return "Garbage Collection";
              }

              if (
                category.includes("choked drain") ||
                category.includes("gutter overflow") ||
                category.includes("public washroom")
              ) {
                return "Sanitation Department";
              }

              return "General";
            })()}
          </p>

          {request.aiWasteType && (
            <p>
              <strong>AI Waste Category:</strong> {request.aiWasteType}
            </p>
          )}

          {request.aiConfidence > 0 && (
            <p>
              <strong>AI Confidence:</strong> {request.aiConfidence}%
            </p>
          )}
        </div>

        <p style={styles.description}>
          {request.description || "No description provided"}
        </p>

        {priority === "High" && (
          <div style={styles.emergencyBox}>
            🚨 Emergency sanitation request. Handle this before normal requests.
          </div>
        )}

        {request.aiImagePrediction && (
          <p style={styles.description}>
            <strong>AI Detected Object:</strong> {request.aiImagePrediction}
          </p>
        )}

        {request.noticeSent && (
          <div style={styles.noticeBox}>
            🚨 Admin notice has been sent for this request.
          </div>
        )}

        {request.media && (
          <a
            style={styles.link}
            href={`${API_BASE}/uploads/${request.media}`}
            target="_blank"
            rel="noreferrer"
          >
            View Attachment
          </a>
        )}

        <div style={styles.actionRow}>
          {request.status === "pending" && !request.noticeSent && (
            <button
              style={styles.primaryBtn}
              onClick={() => acceptRequest(request._id)}
            >
              Accept
            </button>
          )}

          {request.status === "accepted" && (
            <button
              style={styles.successBtn}
              onClick={() => completeRequest(request._id)}
            >
              Mark Completed
            </button>
          )}

          {request.noticeSent && !request.noticeAccepted && (
            <button
              style={styles.warningBtn}
              onClick={() => acceptNotice(request._id)}
            >
              Accept Notice
            </button>
          )}

          {request.noticeSent &&
            request.noticeAccepted &&
            !request.problemResolved && (
              <button
                style={styles.successBtn}
                onClick={() => resolveProblem(request._id)}
              >
                Mark as Resolved
              </button>
            )}

          <button style={styles.mapBtn} onClick={() => openMapRoute(request)}>
            View Map Route
          </button>
        </div>
      </div>
    );
  };

  const renderComplaintCard = (complaint) => (
    <div key={complaint._id} style={styles.taskCard}>
      <div style={styles.cardTop}>
        <div>
          <h3>{complaint.category || "Citizen Complaint"}</h3>
          <p style={styles.mutedText}>
            {new Date(complaint.createdAt).toLocaleString()}
          </p>
        </div>

        <span style={getStatusStyle(complaint.status)}>
          {complaint.status}
        </span>
      </div>

      <div style={styles.infoGrid}>
        <p>
          <strong>Category:</strong> {complaint.category || "Other"}
        </p>

        <p>
          <strong>Citizen:</strong> {getCitizenName(complaint)}
        </p>

        <p>
          <strong>Phone:</strong> {getCitizenPhone(complaint)}
        </p>

        <p>
          <strong>Address:</strong> {getCitizenAddress(complaint)}
        </p>

        <p>
          <strong>Notice:</strong>{" "}
          {complaint.noticeSent ? "Sent by Admin" : "Not sent"}
        </p>
      </div>

      <p style={styles.description}>
        {complaint.message || "No complaint message provided"}
      </p>

      {complaint.media && (
        <a
          style={styles.link}
          href={`${API_BASE}/uploads/${complaint.media}`}
          target="_blank"
          rel="noreferrer"
        >
          View Attachment
        </a>
      )}

      <div style={styles.actionRow}>
        {complaint.status === "pending" && complaint.noticeSent && (
          <button
            style={styles.primaryBtn}
            onClick={() => acceptComplaint(complaint._id)}
          >
            Accept Complaint
          </button>
        )}

        {complaint.status === "accepted" && (
          <button
            style={styles.successBtn}
            onClick={() => completeComplaint(complaint._id)}
          >
            Mark Completed
          </button>
        )}

        {complaint.status === "completed" && (
          <button style={styles.successBtn}>
            Complaint Completed
          </button>
        )}

        <button
          style={styles.mapBtn}
          onClick={() => openMapRoute(complaint)}
        >
          View Map Route
        </button>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div style={styles.panel}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>Service Requests</h2>
          <p>View, accept and complete assigned department requests.</p>
        </div>

        <select
          style={styles.select}
          value={requestFilter}
          onChange={(e) => setRequestFilter(e.target.value)}
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {sortedFilteredRequests.length === 0 ? (
        <p style={styles.emptyText}>No requests found.</p>
      ) : (
        sortedFilteredRequests.map(renderRequestCard)
      )}
    </div>
  );

  const renderNotices = () => {
    const notices = requests
      .filter((r) => r.noticeSent === true)
      .sort((a, b) => {
        const priorityDiff = getPriorityRank(a) - getPriorityRank(b);

        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        return new Date(b.createdAt) - new Date(a.createdAt);
      });

    return (
      <div style={styles.panel}>
        <div style={styles.sectionHeader}>
          <div>
            <h2>Admin Notices</h2>
            <p>Urgent service issues sent by admin for worker action.</p>
          </div>
        </div>

        {notices.length === 0 ? (
          <p style={styles.emptyText}>No admin notices available.</p>
        ) : (
          notices.map(renderRequestCard)
        )}
      </div>
    );
  };

  const renderComplaints = () => (
    <div style={styles.panel}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>Citizen Complaints</h2>
          <p>Complaints forwarded by admin for worker resolution.</p>
        </div>

        <select
          style={styles.select}
          value={complaintFilter}
          onChange={(e) => setComplaintFilter(e.target.value)}
        >
          <option value="all">All Complaints</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {filteredComplaints.length === 0 ? (
        <p style={styles.emptyText}>No complaints found.</p>
      ) : (
        filteredComplaints.map(renderComplaintCard)
      )}
    </div>
  );

  const renderMyComplaintHistory = () => (
    <div style={styles.panel}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>My Complaint History</h2>
          <p>Track the complaints you submitted to admin and their current status.</p>
        </div>

        <select
          style={styles.select}
          value={myComplaintFilter}
          onChange={(e) => setMyComplaintFilter(e.target.value)}
        >
          <option value="all">All Complaints</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {filteredMyComplaints.length === 0 ? (
        <p style={styles.emptyText}>No complaints submitted by you yet.</p>
      ) : (
        filteredMyComplaints.map((complaint) => (
          <div key={complaint._id} style={styles.taskCard}>
            <div style={styles.cardTop}>
              <div>
                <h3>{complaint.category || "Worker Complaint"}</h3>
                <p style={styles.mutedText}>
                  {new Date(complaint.createdAt).toLocaleString()}
                </p>
              </div>

              <span style={getStatusStyle(complaint.status)}>
                {complaint.status}
              </span>
            </div>

            <div style={styles.infoGrid}>
              <p>
                <strong>Status:</strong> {complaint.status}
              </p>

              <p>
                <strong>Accepted By:</strong>{" "}
                {complaint.acceptedBy?.fullName ||
                  complaint.acceptedBy?.name ||
                  "Not accepted yet"}
              </p>

              <p>
                <strong>Completed By:</strong>{" "}
                {complaint.completedBy?.fullName ||
                  complaint.completedBy?.name ||
                  "Not completed yet"}
              </p>

              <p>
                <strong>Completed At:</strong>{" "}
                {complaint.completedAt
                  ? new Date(complaint.completedAt).toLocaleString()
                  : "Not completed yet"}
              </p>
            </div>

            <p style={styles.description}>
              {complaint.message || "No complaint message provided"}
            </p>

            {complaint.media && (
              <a
                style={styles.link}
                href={`${API_BASE}/uploads/${complaint.media}`}
                target="_blank"
                rel="noreferrer"
              >
                View Attachment
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderRaiseComplaint = () => (
    <div style={styles.panel}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>Raise Complaint to Admin</h2>
          <p>Submit a complaint or issue directly to the admin.</p>
        </div>
      </div>

      <label style={styles.label}>Complaint Message</label>
      <textarea
        style={styles.textarea}
        placeholder="Describe your issue..."
        value={workerComplaint}
        onChange={(e) => setWorkerComplaint(e.target.value)}
      />

      <label style={styles.label}>Attachment Optional</label>
      <input
        style={styles.input}
        type="file"
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={(e) => setWorkerComplaintMedia(e.target.files[0])}
      />

      {workerComplaintMedia && (
        <p style={styles.mutedText}>
          Selected file: {workerComplaintMedia.name}
        </p>
      )}

      <button style={styles.primaryBtn} onClick={submitWorkerComplaint}>
        Submit Complaint
      </button>
    </div>
  );

  const getTitle = () => {
    if (activeSection === "overview") return "Worker Dashboard";
    if (activeSection === "requests") return "Service Requests";
    if (activeSection === "notices") return "Admin Notices";
    if (activeSection === "complaints") return "Citizen Complaints";
    if (activeSection === "raiseComplaint") return "Raise Complaint";
    if (activeSection === "myComplaints") return "My Complaint History";
    return "Worker Dashboard";
  };

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brand}>
            <div style={styles.logo}>SW</div>

            <div>
              <h2>Smart Waste</h2>
              <p>Worker Panel</p>
            </div>
          </div>

          <div style={styles.profileCard}>
            <div style={styles.avatar}>
              {(worker?.fullName || worker?.name || "W")
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div>
              <h3>{worker?.fullName || worker?.name || "Worker"}</h3>
              <p>{worker?.email || "worker@email.com"}</p>
              <span>{worker?.department || "Department"}</span>
            </div>
          </div>

          <nav style={styles.nav}>
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

        <button style={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </aside>

      <main style={styles.main}>
        <header style={styles.topbar}>
          <div>
            <h1>{getTitle()}</h1>
            <p>Manage assigned requests, notices and complaints efficiently.</p>
          </div>

          <button
            style={{
              ...styles.refreshBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onClick={fetchAllData}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {activeSection === "overview" && renderOverview()}
        {activeSection === "requests" && renderRequests()}
        {activeSection === "notices" && renderNotices()}
        {activeSection === "complaints" && renderComplaints()}
        {activeSection === "raiseComplaint" && renderRaiseComplaint()}
        {activeSection === "myComplaints" && renderMyComplaintHistory()}
      </main>
    </div>
  );
}

function commonStyles() {
  return {
    shell: {
      minHeight: "100vh",
      display: "flex",
      background: "#020617",
      color: "#f8fafc",
      fontFamily:
        "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },

    sidebar: {
      width: "300px",
      background: "linear-gradient(180deg, #0f172a, #020617)",
      borderRight: "1px solid #334155",
      padding: "22px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100vh",
      position: "sticky",
      top: 0,
      boxSizing: "border-box",
    },

    brand: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "26px",
    },

    logo: {
      width: "50px",
      height: "50px",
      borderRadius: "18px",
      background: "linear-gradient(135deg, #22c55e, #3b82f6, #8b5cf6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "900",
      fontSize: "18px",
      color: "white",
      boxShadow: "0 12px 30px rgba(59,130,246,0.35)",
    },

    profileCard: {
      background: "rgba(30,41,59,0.75)",
      border: "1px solid #334155",
      padding: "16px",
      borderRadius: "24px",
      display: "flex",
      alignItems: "center",
      gap: "13px",
      marginBottom: "26px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
    },

    avatar: {
      width: "52px",
      height: "52px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #06b6d4, #6366f1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "900",
      fontSize: "22px",
      color: "white",
    },

    nav: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },

    navButton: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      width: "100%",
      border: "none",
      borderRadius: "16px",
      background: "transparent",
      color: "#94a3b8",
      padding: "13px 14px",
      cursor: "pointer",
      fontWeight: "800",
      textAlign: "left",
    },

    activeNavButton: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      width: "100%",
      border: "none",
      borderRadius: "16px",
      background: "linear-gradient(135deg, #2563eb, #7c3aed)",
      color: "white",
      padding: "13px 14px",
      cursor: "pointer",
      fontWeight: "900",
      textAlign: "left",
      boxShadow: "0 12px 30px rgba(37,99,235,0.35)",
    },

    logoutBtn: {
      border: "none",
      borderRadius: "16px",
      background: "#ef4444",
      color: "white",
      padding: "13px",
      cursor: "pointer",
      fontWeight: "900",
    },

    main: {
      flex: 1,
      padding: "28px",
      overflowX: "hidden",
    },

    topbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
      marginBottom: "24px",
    },

    refreshBtn: {
      border: "1px solid #334155",
      borderRadius: "16px",
      background: "#111827",
      color: "#f8fafc",
      padding: "12px 18px",
      cursor: "pointer",
      fontWeight: "800",
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
      gap: "18px",
      marginBottom: "24px",
    },

    statCard: {
      background:
        "linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))",
      border: "1px solid #334155",
      borderRadius: "24px",
      padding: "20px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    },

    statIcon: {
      fontSize: "28px",
    },

    quickGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: "18px",
    },

    quickCard: {
      background: "#111827",
      border: "1px solid #334155",
      borderRadius: "24px",
      padding: "24px",
      cursor: "pointer",
      boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
    },

    panel: {
      background: "#111827",
      border: "1px solid #334155",
      borderRadius: "28px",
      padding: "24px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
    },

    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "16px",
      flexWrap: "wrap",
      marginBottom: "22px",
    },

    select: {
      background: "#020617",
      color: "#f8fafc",
      border: "1px solid #334155",
      borderRadius: "14px",
      padding: "12px",
      outline: "none",
      fontWeight: "700",
    },

    label: {
      display: "block",
      marginBottom: "8px",
      marginTop: "14px",
      fontWeight: "800",
      color: "#f8fafc",
    },

    input: {
      width: "100%",
      padding: "13px",
      borderRadius: "14px",
      border: "1px solid #334155",
      background: "#020617",
      color: "#f8fafc",
      outline: "none",
      marginBottom: "13px",
      boxSizing: "border-box",
    },

    textarea: {
      width: "100%",
      minHeight: "130px",
      padding: "13px",
      borderRadius: "14px",
      border: "1px solid #334155",
      background: "#020617",
      color: "#f8fafc",
      outline: "none",
      marginBottom: "13px",
      boxSizing: "border-box",
      resize: "vertical",
    },

    taskCard: {
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "22px",
      padding: "20px",
      marginBottom: "16px",
      boxShadow: "0 16px 34px rgba(0,0,0,0.25)",
    },

    cardTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "12px",
      marginBottom: "14px",
    },

    infoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "8px 18px",
      marginBottom: "12px",
      color: "#cbd5e1",
    },

    areaBox: {
      background: "#020617",
      border: "1px solid #334155",
      borderRadius: "14px",
      padding: "12px",
      color: "#cbd5e1",
      lineHeight: 1.6,
    },

    phoneBox: {
      background: "#020617",
      border: "1px solid #334155",
      borderRadius: "14px",
      padding: "12px",
      color: "#cbd5e1",
      lineHeight: 1.6,
    },

    priorityBox: {
      background: "#020617",
      border: "1px solid #334155",
      borderRadius: "14px",
      padding: "12px",
      color: "#cbd5e1",
      lineHeight: 1.6,
    },

    description: {
      background: "#020617",
      border: "1px solid #334155",
      borderRadius: "14px",
      padding: "12px",
      color: "#cbd5e1",
      lineHeight: 1.6,
    },

    aiSuggestedDepartment: {
      background: "#020617",
      border: "1px solid #334155",
      borderRadius: "14px",
      padding: "12px",
      color: "#cbd5e1",
      lineHeight: 1.6,
    },

    emergencyBox: {
      background: "rgba(239,68,68,0.16)",
      border: "1px solid rgba(239,68,68,0.45)",
      color: "#f87171",
      padding: "12px",
      borderRadius: "14px",
      marginBottom: "12px",
      fontWeight: "900",
    },

    noticeBox: {
      background: "rgba(245,158,11,0.15)",
      border: "1px solid rgba(245,158,11,0.45)",
      color: "#fbbf24",
      padding: "12px",
      borderRadius: "14px",
      marginBottom: "12px",
      fontWeight: "800",
    },

    actionRow: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginTop: "15px",
    },

    primaryBtn: {
      border: "none",
      borderRadius: "14px",
      background: "linear-gradient(135deg, #2563eb, #7c3aed)",
      color: "white",
      padding: "11px 16px",
      cursor: "pointer",
      fontWeight: "900",
    },

    successBtn: {
      border: "none",
      borderRadius: "14px",
      background: "#16a34a",
      color: "white",
      padding: "11px 16px",
      cursor: "pointer",
      fontWeight: "900",
    },

    warningBtn: {
      border: "none",
      borderRadius: "14px",
      background: "#f59e0b",
      color: "#111827",
      padding: "11px 16px",
      cursor: "pointer",
      fontWeight: "900",
    },

    mapBtn: {
      border: "1px solid #334155",
      borderRadius: "14px",
      background: "#020617",
      color: "#93c5fd",
      padding: "11px 16px",
      cursor: "pointer",
      fontWeight: "900",
    },

    pendingBadge: {
      background: "rgba(245,158,11,0.2)",
      color: "#fbbf24",
      padding: "7px 13px",
      borderRadius: "999px",
      fontWeight: "900",
      textTransform: "capitalize",
    },

    acceptedBadge: {
      background: "rgba(59,130,246,0.2)",
      color: "#93c5fd",
      padding: "7px 13px",
      borderRadius: "999px",
      fontWeight: "900",
      textTransform: "capitalize",
    },

    completedBadge: {
      background: "rgba(34,197,94,0.2)",
      color: "#86efac",
      padding: "7px 13px",
      borderRadius: "999px",
      fontWeight: "900",
      textTransform: "capitalize",
    },

    mutedText: {
      color: "#94a3b8",
      margin: "4px 0",
    },

    link: {
      color: "#60a5fa",
      textDecoration: "none",
      fontWeight: "800",
    },

    emptyText: {
      color: "#94a3b8",
      background: "#1e293b",
      border: "1px dashed #334155",
      padding: "18px",
      borderRadius: "16px",
    },
  };
}

export default WorkerDashboard;