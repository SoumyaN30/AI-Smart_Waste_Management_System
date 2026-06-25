import { useEffect, useState } from "react";
import axios from "axios";
import LocationPicker from "../components/LocationPicker";
import WasteCameraAI from "../components/WasteCameraAI";

function CitizenDashboard() {
  const styles = commonStyles();

  const token = sessionStorage.getItem("token") || sessionStorage.getItem("token");
  const API_BASE = "http://localhost:5000";

  const [activeSection, setActiveSection] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    landmark: "",
    latitude: null,
    longitude: null,
  });

  const [editProfile, setEditProfile] = useState(false);
  const [showProfileMap, setShowProfileMap] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [request, setRequest] = useState({
    category: "Household Garbage Pickup",
    area: "",
    description: "",
    latitude: null,
    longitude: null,
    address: "",
    aiWasteType: "",
    aiImagePrediction: "",
    aiConfidence: 0,
  });

  const [requestMedia, setRequestMedia] = useState(null);

  const [complaint, setComplaint] = useState({
    category: "Household Garbage Pickup",
    message: "",
  });

  const [complaintMedia, setComplaintMedia] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const [requests, setRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);

  const [requestFilter, setRequestFilter] = useState("all");
  const [complaintFilter, setComplaintFilter] = useState("all");

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

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

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return styles.highPriority;
    }

    return styles.mediumPriority;
  };

  const getPriorityReason = (category) => {
    const priority = getRequestPriority(category);

    if (priority === "High") {
      return "Emergency sanitation issue. This request needs quick action.";
    }

    return "Normal municipal service request.";
  };

  const resetRequestForm = () => {
    setRequest({
      category: "Household Garbage Pickup",
      area: "",
      description: "",
      latitude: null,
      longitude: null,
      address: "",
      aiWasteType: "",
      aiImagePrediction: "",
      aiConfidence: 0,
    });

    setRequestMedia(null);
    setShowLocationPicker(false);
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/users/profile`, {
        headers: getHeaders(),
      });

      const user = res.data;

      setProfile({
        name: user.fullName || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        landmark: user.landmark || "",
        latitude: user.mapLocation?.lat || user.latitude || null,
        longitude: user.mapLocation?.lng || user.longitude || null,
      });
    } catch (err) {
      console.log("Fetch profile error:", err);
    }
  };

  const fetchData = async () => {
    try {
      const reqRes = await axios.get(`${API_BASE}/api/requests/my`, {
        headers: getHeaders(),
      });

      const compRes = await axios.get(`${API_BASE}/api/complaints/my`, {
        headers: getHeaders(),
      });

      setRequests(reqRes.data || []);
      setComplaints(compRes.data || []);
    } catch (err) {
      console.log("Fetch data error:", err);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchProfile();
      await fetchData();
    } catch (err) {
      console.log("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchData();

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeSection === "profile") {
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [activeSection]);

  const updateProfile = async () => {
    try {
      if (!profile.name || !profile.phone || !profile.address) {
        alert("Full name, phone number and address are required");
        return;
      }

      if (!/^[0-9]{10}$/.test(profile.phone)) {
        alert("Phone number must be exactly 10 digits");
        return;
      }

      const payload = {
        fullName: profile.name,
        phone: profile.phone,
        address: profile.address,
        landmark: profile.landmark,
        mapLocation: {
          lat: profile.latitude,
          lng: profile.longitude,
        },
      };

      const res = await axios.put(`${API_BASE}/api/users/profile`, payload, {
        headers: getHeaders(),
      });

      const updatedUser = res.data.user;

      setProfile({
        name: updatedUser.fullName || updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        address: updatedUser.address || "",
        landmark: updatedUser.landmark || "",
        latitude: updatedUser.mapLocation?.lat || updatedUser.latitude || null,
        longitude: updatedUser.mapLocation?.lng || updatedUser.longitude || null,
      });

      alert(res.data.message || "Profile updated successfully");
      setEditProfile(false);
      setShowProfileMap(false);
    } catch (err) {
      console.log("Update profile error:", err);
      alert(err.response?.data?.message || "Profile update failed");
    }
  };

  const changePassword = async () => {
    try {
      if (
        !passwordData.oldPassword ||
        !passwordData.newPassword ||
        !passwordData.confirmPassword
      ) {
        alert("Old password, new password and confirm password are required");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert("New password and confirm password do not match");
        return;
      }

      const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

      if (!passwordRegex.test(passwordData.newPassword)) {
        alert("Password must contain letters, numbers and symbols");
        return;
      }

      const res = await axios.put(
        `${API_BASE}/api/users/change-password`,
        passwordData,
        {
          headers: getHeaders(),
        }
      );

      alert(res.data.message || "Password changed successfully");

      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Password change failed");
    }
  };

  const submitRequest = async (e) => {
    e.preventDefault();

    if (!request.category || !request.area.trim()) {
      alert("Category and area are required");
      return;
    }

    if (request.category === "Household Garbage Pickup") {
      if (!request.aiWasteType) {
        alert("Please capture image and predict waste type before submitting");
        return;
      }

      if (!requestMedia) {
        alert("Please capture waste image before submitting");
        return;
      }
    }

    if (request.category !== "Household Garbage Pickup" && !requestMedia) {
      alert("Photo/video required for this request");
      return;
    }

    const data = new FormData();

    data.append("category", request.category);
    data.append("area", request.area);
    data.append("description", request.description || "");
    data.append("priority", getRequestPriority(request.category));
    data.append("aiWasteType", request.aiWasteType || "");
    data.append("aiImagePrediction", request.aiImagePrediction || "");
    data.append("aiConfidence", request.aiConfidence || 0);

    if (request.latitude && request.longitude) {
      data.append("latitude", request.latitude);
      data.append("longitude", request.longitude);
      data.append("address", request.address || request.area);
    }

    if (requestMedia) {
      data.append("media", requestMedia);
    }

    try {
      await axios.post(`${API_BASE}/api/requests`, data, {
        headers: getHeaders(),
      });

      alert("Request submitted successfully");
      resetRequestForm();
      fetchData();
    } catch (err) {
      console.log("Request submit error:", err);
      alert(err.response?.data?.msg || "Request failed");
    }
  };

  const submitComplaint = async () => {
    if (!complaint.message.trim()) {
      alert("Enter complaint message");
      return;
    }

    const data = new FormData();

    data.append("category", complaint.category);
    data.append("message", complaint.message);

    if (complaintMedia) {
      data.append("media", complaintMedia);
    }

    try {
      await axios.post(`${API_BASE}/api/complaints`, data, {
        headers: getHeaders(),
      });

      alert("Complaint submitted");

      setComplaint({
        category: "Household Garbage Pickup",
        message: "",
      });

      setComplaintMedia(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.msg || "Complaint failed");
    }
  };

  const logout = () => {
    sessionStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const filteredRequests = requests.filter((r) => {
    if (requestFilter === "all") return true;
    return r.status === requestFilter;
  });

  const sortedFilteredRequests = [...filteredRequests].sort((a, b) => {
    const priorityA = getRequestPriority(a);
    const priorityB = getRequestPriority(b);

    if (priorityA === "High" && priorityB !== "High") return -1;
    if (priorityA !== "High" && priorityB === "High") return 1;

    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const filteredComplaints = complaints.filter((c) => {
    if (complaintFilter === "all") return true;
    return c.status === complaintFilter;
  });

  const navItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "request", label: "Raise Request", icon: "🗑️" },
    { id: "complaint", label: "Complaint", icon: "📢" },
    { id: "requestHistory", label: "Request History", icon: "📋" },
    { id: "complaintHistory", label: "Complaint History", icon: "📝" },
  ];

  const completedRequests = requests.filter((r) => r.status === "completed");
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const completedComplaints = complaints.filter((c) => c.status === "completed");

  const getTitle = () => {
    if (activeSection === "overview") return "Citizen Dashboard";
    if (activeSection === "profile") return "My Profile";
    if (activeSection === "request") return "Raise Service Request";
    if (activeSection === "complaint") return "Raise Complaint";
    if (activeSection === "requestHistory") return "Request History";
    if (activeSection === "complaintHistory") return "Complaint History";
    return "Citizen Dashboard";
  };

  const renderOverview = () => (
    <>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span>🗑️</span>
          <h3>Total Requests</h3>
          <p>{requests.length}</p>
        </div>

        <div style={styles.statCard}>
          <span>⏳</span>
          <h3>Pending Requests</h3>
          <p>{pendingRequests.length}</p>
        </div>

        <div style={styles.statCard}>
          <span>✅</span>
          <h3>Completed Requests</h3>
          <p>{completedRequests.length}</p>
        </div>

        <div style={styles.statCard}>
          <span>📢</span>
          <h3>Total Complaints</h3>
          <p>{complaints.length}</p>
        </div>

        <div style={styles.statCard}>
          <span>🛠️</span>
          <h3>Resolved Complaints</h3>
          <p>{completedComplaints.length}</p>
        </div>
      </div>

      <div style={styles.quickGrid}>
        <div style={styles.quickCard} onClick={() => setActiveSection("request")}>
          <h3>Raise New Request</h3>
          <p>Submit pickup or cleaning related service requests.</p>
          <button style={styles.primaryBtn}>Open</button>
        </div>

        <div style={styles.quickCard} onClick={() => setActiveSection("complaint")}>
          <h3>Raise Complaint</h3>
          <p>Report unresolved public waste or service issues.</p>
          <button style={styles.primaryBtn}>Open</button>
        </div>

        <div
          style={styles.quickCard}
          onClick={() => setActiveSection("requestHistory")}
        >
          <h3>Request History</h3>
          <p>Track all submitted requests and worker status.</p>
          <button style={styles.primaryBtn}>Open</button>
        </div>

        <div
          style={styles.quickCard}
          onClick={() => setActiveSection("complaintHistory")}
        >
          <h3>Complaint History</h3>
          <p>Track all complaints submitted by you.</p>
          <button style={styles.primaryBtn}>Open</button>
        </div>
      </div>
    </>
  );

  const renderProfile = () => (
    <div style={styles.panel}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>My Profile</h2>
          <p>View and edit your citizen profile details.</p>
        </div>

        {!editProfile && (
          <button style={styles.secondaryBtn} onClick={() => setEditProfile(true)}>
            Edit Profile
          </button>
        )}
      </div>

      <div style={styles.profileGrid}>
        <div style={styles.profileInfoCard}>
          <h3>Personal Details</h3>

          <label>Full Name</label>
          <input
            style={styles.input}
            disabled={!editProfile}
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />

          <label>Email</label>
          <input style={styles.input} disabled value={profile.email} />

          <label>Phone Number</label>
          <input
            style={styles.input}
            disabled={!editProfile}
            maxLength="10"
            value={profile.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setProfile({ ...profile, phone: value });
            }}
          />

          <label>Address</label>
          <textarea
            style={styles.textarea}
            disabled={!editProfile}
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
          />

          <label>Landmark</label>
          <input
            style={styles.input}
            disabled={!editProfile}
            value={profile.landmark}
            onChange={(e) => setProfile({ ...profile, landmark: e.target.value })}
          />

          {editProfile && (
            <>
              <button
                type="button"
                style={styles.locationBtn}
                onClick={() => setShowProfileMap(!showProfileMap)}
              >
                {showProfileMap ? "Hide Map" : "Select Address on Map"}
              </button>

              {showProfileMap && (
                <div style={styles.mapBox}>
                  <LocationPicker
                    onLocationSelect={(location) => {
                      setProfile({
                        ...profile,
                        latitude: location.latitude,
                        longitude: location.longitude,
                      });
                    }}
                    initialLocation={{
                      latitude: profile.latitude,
                      longitude: profile.longitude,
                    }}
                  />
                </div>
              )}
            </>
          )}

          {profile.latitude && profile.longitude && (
            <p style={styles.successText}>
              Location selected: {Number(profile.latitude).toFixed(4)},{" "}
              {Number(profile.longitude).toFixed(4)}
            </p>
          )}

          {editProfile && (
            <div style={styles.actionRow}>
              <button style={styles.primaryBtn} onClick={updateProfile}>
                Save Changes
              </button>

              <button
                style={styles.cancelBtn}
                onClick={() => {
                  setEditProfile(false);
                  setShowProfileMap(false);
                  fetchProfile();
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div style={styles.profileInfoCard}>
          <h3>Change Password</h3>

          <form
            style={styles.passwordForm}
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
              changePassword();
            }}
          >
            <input
              type="text"
              name="fakeUsername"
              autoComplete="username"
              style={styles.hiddenInput}
              tabIndex="-1"
            />

            <input
              type="password"
              name="fakePassword"
              autoComplete="current-password"
              style={styles.hiddenInput}
              tabIndex="-1"
            />

            <label>Old Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Enter old password"
              value={passwordData.oldPassword}
              autoComplete="new-password"
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  oldPassword: e.target.value,
                })
              }
            />

            <label>New Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Enter new password"
              value={passwordData.newPassword}
              autoComplete="new-password"
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
            />

            <label>Confirm New Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Confirm new password"
              value={passwordData.confirmPassword}
              autoComplete="new-password"
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
            />

            <p style={styles.hint}>
              Password must contain letters, numbers and symbols.
            </p>

            <button type="submit" style={styles.dangerBtn}>
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderRequest = () => {
    const selectedPriority = getRequestPriority(request.category);

    return (
      <div style={styles.panel}>
        <h2>Raise Service Request</h2>
        <p style={styles.subText}>Submit a waste collection or cleaning request.</p>

        <form onSubmit={submitRequest}>
          <label>Request Category</label>
          <select
            style={styles.input}
            value={request.category}
            onChange={(e) => {
              const selectedCategory = e.target.value;

              setRequest({
                ...request,
                category: selectedCategory,
                aiWasteType: "",
                aiImagePrediction: "",
                aiConfidence: 0,
              });

              setRequestMedia(null);
            }}
          >
            <option>Household Garbage Pickup</option>
            <option>Clean Roadside Fallen Leaves</option>
            <option>Public Washroom Cleaning</option>
            <option>Choked Drain</option>
            <option>Area Garbage Pickup</option>
            <option>Gutter Overflow</option>
            <option>Other</option>
          </select>

          <div style={styles.priorityPreviewBox}>
            <strong>Request Priority:</strong>{" "}
            <span style={getPriorityStyle(selectedPriority)}>
              {getPriorityLabel(selectedPriority)}
            </span>
            <p>{getPriorityReason(request.category)}</p>
          </div>

          <label>Area Name</label>
          <input
            style={styles.input}
            placeholder="Enter area name"
            value={request.area}
            onChange={(e) => setRequest({ ...request, area: e.target.value })}
            required
          />

          <label>Description</label>
          <textarea
            style={styles.textarea}
            placeholder="Describe the waste/service issue"
            value={request.description}
            onChange={(e) =>
              setRequest({ ...request, description: e.target.value })
            }
          />

          {request.category === "Household Garbage Pickup" && (
            <>
              <WasteCameraAI
                onPrediction={(prediction) => {
                  setRequest((prev) => ({
                    ...prev,
                    aiWasteType: prediction.wasteType,
                    aiImagePrediction: prediction.modelLabel || prediction.wasteType,
                    aiConfidence: prediction.confidence,
                  }));

                  if (prediction.imageFile) {
                    setRequestMedia(prediction.imageFile);
                  }
                }}
                onClearPrediction={() => {
                  setRequest((prev) => ({
                    ...prev,
                    aiWasteType: "",
                    aiImagePrediction: "",
                    aiConfidence: 0,
                  }));

                  setRequestMedia(null);
                }}
              />

              {request.aiWasteType && (
                <div style={styles.aiResultBox}>
                  <h3>🤖 AI Waste Segregation Prediction</h3>

                  <p>
                    <strong>Waste Category:</strong> {request.aiWasteType}
                  </p>

                  <p>
                    <strong>Detected Object:</strong>{" "}
                    {request.aiImagePrediction || request.aiWasteType}
                  </p>

                  <p>
                    <strong>Confidence:</strong> {request.aiConfidence}%
                  </p>
                </div>
              )}
            </>
          )}

          {request.category !== "Household Garbage Pickup" && (
            <>
              <label>Upload Photo/Video</label>
              <input
                style={styles.input}
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setRequestMedia(e.target.files[0])}
                required
              />
            </>
          )}

          <button
            type="button"
            style={styles.locationBtn}
            onClick={() => setShowLocationPicker(!showLocationPicker)}
          >
            {showLocationPicker ? "Hide Location Picker" : "Select Location"}
          </button>

          {showLocationPicker && (
            <div style={styles.mapBox}>
              <LocationPicker
                onLocationSelect={(location) => {
                  setRequest({
                    ...request,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    address: request.area,
                  });
                }}
                initialLocation={{
                  latitude: request.latitude,
                  longitude: request.longitude,
                }}
              />
            </div>
          )}

          {request.latitude && request.longitude && (
            <p style={styles.successText}>
              Location selected: {Number(request.latitude).toFixed(4)},{" "}
              {Number(request.longitude).toFixed(4)}
            </p>
          )}

          <button type="submit" style={styles.primaryBtn}>
            Submit Request
          </button>
        </form>
      </div>
    );
  };

  const renderComplaint = () => (
    <div style={styles.panel}>
      <h2>Raise Complaint</h2>
      <p style={styles.subText}>Submit a complaint related to waste services.</p>

      <label>Complaint Category</label>
      <select
        style={styles.input}
        value={complaint.category}
        onChange={(e) =>
          setComplaint({
            ...complaint,
            category: e.target.value,
          })
        }
      >
        <option>Household Garbage Pickup</option>
        <option>Clean Roadside Fallen Leaves</option>
        <option>Public Washroom Cleaning</option>
        <option>Choked Drain</option>
        <option>Area Garbage Pickup</option>
        <option>Gutter Overflow</option>
        <option>Other</option>
      </select>

      <label>Complaint Message</label>
      <textarea
        style={styles.textarea}
        placeholder="Complaint message"
        value={complaint.message}
        onChange={(e) =>
          setComplaint({
            ...complaint,
            message: e.target.value,
          })
        }
      />

      <label>Upload Photo/Video Optional</label>
      <input
        style={styles.input}
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setComplaintMedia(e.target.files[0])}
      />

      <button style={styles.primaryBtn} onClick={submitComplaint}>
        Submit Complaint
      </button>
    </div>
  );

  const renderRequestHistory = () => (
    <div style={styles.panel}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>Request History</h2>
          <p>Track your submitted requests.</p>
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
        <p style={styles.emptyText}>No requests found</p>
      ) : (
        sortedFilteredRequests.map((r) => {
          const priority = getRequestPriority(r);

          return (
            <div key={r._id} style={styles.historyCard}>
              <div style={styles.historyTop}>
                <h3>{r.category}</h3>
                <span style={styles.badge}>{r.status}</span>
              </div>

              <p>
                <strong>Area:</strong> {r.area}
              </p>

              <p>
                <strong>Description:</strong> {r.description || "No description"}
              </p>

              <p>
                <strong>Priority:</strong>{" "}
                <span style={getPriorityStyle(priority)}>
                  {getPriorityLabel(priority)}
                </span>
              </p>

              <p>
                <strong>Suggested Department:</strong>{" "}
                {r.assignedDepartment || "General"}
              </p>

              <p>
                <strong>Reason:</strong> {getPriorityReason(r.category)}
              </p>

              {priority === "High" && (
                <div style={styles.emergencyBox}>
                  🚨 Emergency request. Worker should handle this before normal
                  requests.
                </div>
              )}

              {r.aiWasteType && (
                <div style={styles.aiResultBox}>
                  <p>
                    <strong>AI Waste Category:</strong> {r.aiWasteType}
                  </p>

                  <p>
                    <strong>AI Detected Object:</strong>{" "}
                    {r.aiImagePrediction || r.aiWasteType}
                  </p>

                  <p>
                    <strong>AI Confidence:</strong> {r.aiConfidence}%
                  </p>
                </div>
              )}

              <p>
                <strong>Worker:</strong>{" "}
                {r.acceptedBy?.fullName || r.acceptedBy?.name || "Not accepted yet"}
              </p>

              <p>
                <strong>Date:</strong> {new Date(r.createdAt).toLocaleString()}
              </p>

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
            </div>
          );
        })
      )}
    </div>
  );

  const renderComplaintHistory = () => (
    <div style={styles.panel}>
      <div style={styles.sectionHeader}>
        <div>
          <h2>Complaint History</h2>
          <p>Track your submitted complaints.</p>
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
        <p style={styles.emptyText}>No complaints found</p>
      ) : (
        filteredComplaints.map((c) => (
          <div key={c._id} style={styles.historyCard}>
            <div style={styles.historyTop}>
              <h3>{c.category || "Complaint"}</h3>
              <span style={styles.badge}>{c.status}</span>
            </div>

            <p>{c.message}</p>
            <p>Date: {new Date(c.createdAt).toLocaleString()}</p>

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
          </div>
        ))
      )}
    </div>
  );

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brand}>
            <div style={styles.logo}>SW</div>
            <div>
              <h2>Smart Waste</h2>
              <p>Citizen Panel</p>
            </div>
          </div>

          <div style={styles.profileCard}>
            <div style={styles.avatar}>
              {profile.name?.charAt(0)?.toUpperCase() || "C"}
            </div>

            <div>
              <h3>{profile.name || "Citizen"}</h3>
              <p>{profile.email || "citizen@smartwaste.com"}</p>
              <span style={styles.roleBadge}>Citizen</span>
            </div>
          </div>

          <nav style={styles.navList}>
            {navItems.map((item) => (
              <button
                key={item.id}
                style={
                  activeSection === item.id
                    ? styles.activeNavBtn
                    : styles.navBtn
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
        <header style={styles.topBar}>
          <div>
            <h1>{getTitle()}</h1>
            <p>Manage your waste pickup requests and complaints.</p>
          </div>

          <button style={styles.refreshBtn} onClick={handleRefresh}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        <section style={styles.content}>
          {activeSection === "overview" && renderOverview()}
          {activeSection === "profile" && renderProfile()}
          {activeSection === "request" && renderRequest()}
          {activeSection === "complaint" && renderComplaint()}
          {activeSection === "requestHistory" && renderRequestHistory()}
          {activeSection === "complaintHistory" && renderComplaintHistory()}
        </section>
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
      width: "290px",
      background: "#0f172a",
      borderRight: "1px solid #334155",
      padding: "22px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      height: "100vh",
      boxSizing: "border-box",
    },

    brand: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "24px",
    },

    logo: {
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
    },

    profileCard: {
      background: "linear-gradient(135deg, #1e293b, #0f172a)",
      border: "1px solid #334155",
      padding: "16px",
      borderRadius: "22px",
      display: "flex",
      gap: "12px",
      alignItems: "center",
      marginBottom: "24px",
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
      fontWeight: "900",
      fontSize: "20px",
      flexShrink: 0,
    },

    roleBadge: {
      display: "inline-block",
      marginTop: "4px",
      padding: "4px 10px",
      borderRadius: "999px",
      background: "rgba(34,197,94,0.16)",
      color: "#86efac",
      fontSize: "12px",
      fontWeight: "800",
    },

    navList: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },

    navBtn: {
      border: "1px solid transparent",
      background: "transparent",
      color: "#cbd5e1",
      padding: "12px 14px",
      borderRadius: "14px",
      textAlign: "left",
      cursor: "pointer",
      fontWeight: "700",
      display: "flex",
      gap: "10px",
      alignItems: "center",
    },

    activeNavBtn: {
      border: "1px solid #3b82f6",
      background: "rgba(59,130,246,0.16)",
      color: "#ffffff",
      padding: "12px 14px",
      borderRadius: "14px",
      textAlign: "left",
      cursor: "pointer",
      fontWeight: "900",
      display: "flex",
      gap: "10px",
      alignItems: "center",
    },

    logoutBtn: {
      border: "none",
      background: "linear-gradient(135deg, #ef4444, #f97316)",
      color: "white",
      padding: "12px 16px",
      borderRadius: "14px",
      cursor: "pointer",
      fontWeight: "900",
    },

    main: {
      flex: 1,
      padding: "24px",
      overflow: "auto",
    },

    topBar: {
      background: "#0f172a",
      border: "1px solid #334155",
      padding: "20px",
      borderRadius: "24px",
      marginBottom: "22px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
    },

    refreshBtn: {
      border: "none",
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      color: "white",
      padding: "11px 16px",
      borderRadius: "999px",
      cursor: "pointer",
      fontWeight: "900",
    },

    content: {
      maxWidth: "1180px",
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "16px",
      marginBottom: "20px",
    },

    statCard: {
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: "22px",
      padding: "18px",
      boxShadow: "0 14px 35px rgba(0,0,0,0.18)",
    },

    quickGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
      gap: "16px",
    },

    quickCard: {
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: "22px",
      padding: "20px",
      cursor: "pointer",
    },

    panel: {
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: "24px",
      padding: "22px",
    },

    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      gap: "16px",
      alignItems: "center",
      marginBottom: "18px",
    },

    profileGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "18px",
    },

    profileInfoCard: {
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "20px",
      padding: "18px",
    },

    passwordForm: {
      display: "flex",
      flexDirection: "column",
    },

    hiddenInput: {
      position: "absolute",
      left: "-9999px",
      opacity: 0,
      height: 0,
      width: 0,
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      background: "#020617",
      color: "#f8fafc",
      border: "1px solid #334155",
      borderRadius: "14px",
      padding: "12px 14px",
      marginBottom: "14px",
      outline: "none",
    },

    textarea: {
      width: "100%",
      minHeight: "110px",
      boxSizing: "border-box",
      background: "#020617",
      color: "#f8fafc",
      border: "1px solid #334155",
      borderRadius: "14px",
      padding: "12px 14px",
      marginBottom: "14px",
      outline: "none",
      resize: "vertical",
    },

    select: {
      background: "#020617",
      color: "#f8fafc",
      border: "1px solid #334155",
      borderRadius: "14px",
      padding: "10px 14px",
      outline: "none",
    },

    primaryBtn: {
      border: "none",
      background: "linear-gradient(135deg, #22c55e, #14b8a6)",
      color: "white",
      padding: "11px 18px",
      borderRadius: "999px",
      cursor: "pointer",
      fontWeight: "900",
      marginRight: "10px",
      marginTop: "8px",
    },

    secondaryBtn: {
      border: "none",
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      color: "white",
      padding: "11px 18px",
      borderRadius: "999px",
      cursor: "pointer",
      fontWeight: "900",
    },

    dangerBtn: {
      border: "none",
      background: "linear-gradient(135deg, #ef4444, #f97316)",
      color: "white",
      padding: "11px 18px",
      borderRadius: "999px",
      cursor: "pointer",
      fontWeight: "900",
      marginTop: "8px",
    },

    cancelBtn: {
      border: "none",
      background: "#475569",
      color: "white",
      padding: "11px 18px",
      borderRadius: "999px",
      cursor: "pointer",
      fontWeight: "900",
    },

    locationBtn: {
      border: "none",
      background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
      color: "white",
      padding: "11px 18px",
      borderRadius: "999px",
      cursor: "pointer",
      fontWeight: "900",
      marginBottom: "13px",
      marginTop: "8px",
    },

    mapBox: {
      border: "1px solid #334155",
      borderRadius: "18px",
      overflow: "hidden",
      marginBottom: "13px",
    },

    actionRow: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },

    successText: {
      color: "#22c55e",
      fontWeight: "800",
    },

    hint: {
      color: "#94a3b8",
      fontSize: "13px",
    },

    subText: {
      color: "#94a3b8",
    },

    historyCard: {
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "18px",
      padding: "18px",
      marginBottom: "15px",
    },

    historyTop: {
      display: "flex",
      justifyContent: "space-between",
      gap: "12px",
      alignItems: "center",
    },

    badge: {
      background: "rgba(139,92,246,0.2)",
      color: "#c4b5fd",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: "800",
      textTransform: "capitalize",
    },

    link: {
      color: "#60a5fa",
      fontWeight: "800",
      textDecoration: "none",
    },

    emptyText: {
      color: "#94a3b8",
      background: "#1e293b",
      border: "1px dashed #334155",
      padding: "18px",
      borderRadius: "16px",
    },

    aiResultBox: {
      background: "rgba(34,197,94,0.12)",
      border: "1px solid rgba(34,197,94,0.35)",
      borderRadius: "18px",
      padding: "16px",
      margin: "14px 0",
    },

    priorityPreviewBox: {
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "18px",
      padding: "14px",
      marginBottom: "14px",
      color: "#cbd5e1",
    },

    emergencyBox: {
      background: "rgba(239,68,68,0.16)",
      border: "1px solid rgba(239,68,68,0.45)",
      borderRadius: "16px",
      padding: "12px",
      color: "#f87171",
      fontWeight: "900",
      margin: "12px 0",
    },

    highPriority: {
      background: "rgba(239,68,68,0.18)",
      color: "#f87171",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: "900",
      display: "inline-block",
    },

    mediumPriority: {
      background: "rgba(59,130,246,0.18)",
      color: "#60a5fa",
      padding: "6px 12px",
      borderRadius: "999px",
      fontWeight: "900",
      display: "inline-block",
    },
  };
}

export default CitizenDashboard;