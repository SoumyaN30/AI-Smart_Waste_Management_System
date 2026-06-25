import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LocationPicker from "../components/LocationPicker";

function Register() {
  const navigate = useNavigate();

  const API_BASE = "http://localhost:5000";

  const [role, setRole] = useState("citizen");
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    landmark: "",
    department: "",
    latitude: null,
    longitude: null,
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const onlyNumbers = value.replace(/\D/g, "");
      setFormData({
        ...formData,
        phone: onlyNumbers,
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      alert("Please fill all required fields");
      return false;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      alert("Phone number must be exactly 10 digits");
      return false;
    }

    if (role === "worker" && !formData.department) {
      alert("Please select worker department");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Password and confirm password do not match");
      return false;
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

    if (!passwordRegex.test(formData.password)) {
      alert("Password must contain letters, numbers and symbols");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        name: formData.fullName,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        landmark: formData.landmark,
        role,
        department: role === "worker" ? formData.department : "",
        latitude: formData.latitude,
        longitude: formData.longitude,
        mapLocation: {
          lat: formData.latitude,
          lng: formData.longitude,
        },
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const res = await axios.post(`${API_BASE}/api/auth/register`, payload);

      alert(res.data.msg || "Registration successful");

      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("role", res.data.role);
      sessionStorage.setItem("name", res.data.user?.fullName || formData.fullName);
      sessionStorage.setItem("email", res.data.user?.email || formData.email);

      if (res.data.role === "worker") {
        navigate("/worker-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const resetRoleSpecificFields = (selectedRole) => {
    setRole(selectedRole);
    setFormData({
      ...formData,
      department: "",
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1>Register</h1>
          <p>Select your account type and enter your details</p>
        </div>

        <div style={styles.roleBox}>
          <button
            type="button"
            style={role === "citizen" ? styles.activeRoleBtn : styles.roleBtn}
            onClick={() => resetRoleSpecificFields("citizen")}
          >
            👤 Citizen
          </button>

          <button
            type="button"
            style={role === "worker" ? styles.activeRoleBtn : styles.roleBtn}
            onClick={() => resetRoleSpecificFields("worker")}
          >
            👷 Worker
          </button>
        </div>

        <div style={styles.selectedRoleBox}>
          <h2>
            {role === "citizen"
              ? "Create Citizen Account"
              : "Create Worker Account"}
          </h2>
          <p>
            {role === "citizen"
              ? "Citizens can raise waste pickup requests and complaints."
              : "Workers can accept, complete requests and resolve complaints."}
          </p>
        </div>

        <form onSubmit={handleRegister} autoComplete="off">
          <label style={styles.label}>Full Name</label>
          <input
            style={styles.input}
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            autoComplete="off"
          />

          <label style={styles.label}>Email Address</label>
          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            autoComplete="off"
          />

          <label style={styles.label}>Phone Number</label>
          <input
            style={styles.input}
            type="text"
            name="phone"
            placeholder="Enter 10 digit phone number"
            value={formData.phone}
            onChange={handleChange}
            maxLength="10"
            autoComplete="off"
          />

          {role === "worker" && (
            <>
              <label style={styles.label}>Worker Department</label>
              <select
                style={styles.input}
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Select department</option>
                <option value="Garbage Collection">Garbage Collection</option>
                <option value="Sanitation">Sanitation</option>
              </select>
            </>
          )}

          <label style={styles.label}>Full Address</label>
          <textarea
            style={styles.textarea}
            name="address"
            placeholder="Enter your full address"
            value={formData.address}
            onChange={handleChange}
            autoComplete="off"
          />

          <label style={styles.label}>Landmark</label>
          <input
            style={styles.input}
            type="text"
            name="landmark"
            placeholder="Enter nearby landmark"
            value={formData.landmark}
            onChange={handleChange}
            autoComplete="off"
          />

          <button
            type="button"
            style={styles.mapBtn}
            onClick={() => setShowMap(!showMap)}
          >
            {showMap ? "Hide Map" : "Select Address on Map"}
          </button>

          {showMap && (
            <div style={styles.mapBox}>
              <LocationPicker
                onLocationSelect={(location) => {
                  setFormData({
                    ...formData,
                    latitude: location.latitude,
                    longitude: location.longitude,
                  });
                }}
                initialLocation={{
                  latitude: formData.latitude,
                  longitude: formData.longitude,
                }}
              />
            </div>
          )}

          {formData.latitude && formData.longitude && (
            <p style={styles.locationText}>
              Location selected: {Number(formData.latitude).toFixed(4)},{" "}
              {Number(formData.longitude).toFixed(4)}
            </p>
          )}

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
          />

          <label style={styles.label}>Confirm Password</label>
          <input
            style={styles.input}
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />

          <p style={styles.hint}>
            Password must contain letters, numbers and symbols.
          </p>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading
              ? "Creating Account..."
              : role === "citizen"
              ? "Register as Citizen"
              : "Register as Worker"}
          </button>
        </form>

        <p style={styles.loginText}>
          Already have an account?{" "}
          <span style={styles.loginLink} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #020617 0%, #0f172a 45%, #312e81 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 20px",
    color: "#f8fafc",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "780px",
    background: "rgba(15, 23, 42, 0.92)",
    border: "1px solid #334155",
    borderRadius: "28px",
    padding: "38px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
  },

  header: {
    marginBottom: "24px",
  },

  roleBox: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "24px",
  },

  roleBtn: {
    padding: "16px",
    borderRadius: "18px",
    border: "1px solid #334155",
    background: "#111827",
    color: "#94a3b8",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "16px",
  },

  activeRoleBtn: {
    padding: "16px",
    borderRadius: "18px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    cursor: "pointer",
    fontWeight: "900",
    fontSize: "16px",
    boxShadow: "0 12px 30px rgba(37,99,235,0.35)",
  },

  selectedRoleBox: {
    background: "#111827",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "18px",
    marginBottom: "24px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    marginTop: "16px",
    fontWeight: "800",
    color: "#f8fafc",
  },

  input: {
    width: "100%",
    padding: "15px 16px",
    borderRadius: "16px",
    border: "1px solid #334155",
    background: "#111827",
    color: "#f8fafc",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: "105px",
    padding: "15px 16px",
    borderRadius: "16px",
    border: "1px solid #334155",
    background: "#111827",
    color: "#f8fafc",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
    resize: "vertical",
  },

  mapBtn: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "16px",
    background: "#0f766e",
    color: "white",
    cursor: "pointer",
    fontWeight: "900",
    fontSize: "15px",
    marginTop: "18px",
  },

  mapBox: {
    border: "1px solid #334155",
    borderRadius: "18px",
    overflow: "hidden",
    marginTop: "16px",
  },

  locationText: {
    color: "#22c55e",
    fontWeight: "800",
    marginTop: "12px",
  },

  hint: {
    color: "#94a3b8",
    fontSize: "14px",
    marginTop: "12px",
  },

  submitBtn: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #16a34a, #22c55e)",
    color: "white",
    cursor: "pointer",
    fontWeight: "900",
    fontSize: "16px",
    marginTop: "20px",
  },

  loginText: {
    textAlign: "center",
    color: "#94a3b8",
    marginTop: "24px",
  },

  loginLink: {
    color: "#60a5fa",
    cursor: "pointer",
    fontWeight: "900",
  },
};

export default Register;