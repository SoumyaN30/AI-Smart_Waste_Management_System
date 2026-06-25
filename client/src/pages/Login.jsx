import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const API_BASE = "http://localhost:5000";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE}/api/auth/login`, formData);

      const token = res.data.token;
      const role = res.data.role;
      const user = res.data.user;

      if (!token || !role) {
        alert("Login response is missing token or role");
        return;
      }

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", role);
      sessionStorage.setItem("name", user?.fullName || user?.name || "User");
      sessionStorage.setItem("email", user?.email || formData.email);

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", role);
      sessionStorage.setItem("name", user?.fullName || user?.name || "User");
      sessionStorage.setItem("email", user?.email || formData.email);

      alert(res.data.msg || "Login successful");

      if (role === "worker") {
        navigate("/worker-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <style>{styles}</style>

      <div className="background-animation">
        <span className="blob blob-one"></span>
        <span className="blob blob-two"></span>
        <span className="blob blob-three"></span>

        <div className="floating-icon icon-one">♻️</div>
        <div className="floating-icon icon-two">🗑️</div>
        <div className="floating-icon icon-three">🌱</div>
        <div className="floating-icon icon-four">📍</div>
      </div>

      <nav className="top-nav">
        <div className="brand" onClick={() => navigate("/")}>
          <div className="logo">SW</div>
          <div>
            <h2>Smart Waste</h2>
            <p>Management System</p>
          </div>
        </div>

        <button className="home-btn" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </nav>

      <main className="login-layout">
        <section className="left-panel">
          <div className="tag">🚀 Smart City Digital Platform</div>

          <h1>
            Welcome Back to <span>Smart Waste</span>
          </h1>

          <p>
            Login to manage requests, complaints, worker notices, analytics,
            location-based tasks and waste management operations from one
            powerful dashboard.
          </p>

          <div className="feature-list">
            <div>
              <span>👤</span>
              <h3>Citizen</h3>
              <p>Raise requests and complaints.</p>
            </div>

            <div>
              <span>👷</span>
              <h3>Worker</h3>
              <p>Accept and complete assigned tasks.</p>
            </div>

            <div>
              <span>🛡️</span>
              <h3>Admin</h3>
              <p>Monitor, analyze and control the system.</p>
            </div>
          </div>

          <div className="mini-dashboard">
            <div className="dash-header">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="dash-row">
              <p>Requests Completed</p>
              <b>78%</b>
            </div>

            <div className="progress-bar">
              <span></span>
            </div>

            <div className="dash-stats">
              <div>
                <h4>24/7</h4>
                <p>Tracking</p>
              </div>

              <div>
                <h4>Live</h4>
                <p>Analytics</p>
              </div>

              <div>
                <h4>Map</h4>
                <p>Routing</p>
              </div>
            </div>
          </div>
        </section>

        <section className="login-card">
          <div className="card-glow"></div>

          <div className="login-header">
            <div className="login-icon">🔐</div>
            <h2>Login</h2>
            <p>Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} autoComplete="off">
            <label>Email Address</label>
            <div className="input-box">
              <span>📧</span>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>

            <label>Password</label>
            <div className="input-box">
              <span>🔑</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Logging in..." : "Login to Dashboard"}
            </button>
          </form>

          <div className="divider">
            <span></span>
            <p>New user?</p>
            <span></span>
          </div>

          <button className="create-btn" onClick={() => navigate("/register")}>
            Create New Account
          </button>
        </section>
      </main>
    </div>
  );
}

const styles = `
* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

.login-page {
  min-height: 100vh;
  background: #020617;
  color: #f8fafc;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  overflow: hidden;
  position: relative;
}

.background-animation {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.blob {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.38;
  animation: blobMove 9s infinite alternate ease-in-out;
}

.blob-one {
  background: #2563eb;
  top: 8%;
  left: 8%;
}

.blob-two {
  background: #22c55e;
  bottom: 10%;
  right: 10%;
  animation-delay: 2s;
}

.blob-three {
  background: #7c3aed;
  top: 30%;
  right: 35%;
  animation-delay: 4s;
}

@keyframes blobMove {
  from {
    transform: translate(0, 0) scale(1);
  }

  to {
    transform: translate(60px, -50px) scale(1.18);
  }
}

.floating-icon {
  position: absolute;
  width: 58px;
  height: 58px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
  animation: floatIcon 4s infinite ease-in-out;
}

.icon-one {
  top: 18%;
  left: 48%;
}

.icon-two {
  bottom: 18%;
  left: 42%;
  animation-delay: 1s;
}

.icon-three {
  top: 72%;
  right: 8%;
  animation-delay: 1.5s;
}

.icon-four {
  top: 22%;
  right: 12%;
  animation-delay: 2s;
}

@keyframes floatIcon {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-18px) rotate(4deg);
  }
}

.top-nav {
  position: relative;
  z-index: 5;
  padding: 22px 7%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
}

.logo {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  background: linear-gradient(135deg, #22c55e, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: white;
  box-shadow: 0 16px 35px rgba(59, 130, 246, 0.35);
}

.brand h2 {
  margin: 0;
  font-size: 22px;
}

.brand p {
  margin: 2px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

.home-btn {
  border: 1px solid #334155;
  background: rgba(15, 23, 42, 0.78);
  color: #f8fafc;
  padding: 12px 18px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 800;
  transition: 0.25s ease;
}

.home-btn:hover {
  transform: translateY(-3px);
  border-color: #60a5fa;
}

.login-layout {
  position: relative;
  z-index: 2;
  min-height: calc(100vh - 100px);
  padding: 40px 7% 70px;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 55px;
  align-items: center;
}

.left-panel {
  animation: slideInLeft 0.8s ease;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.tag {
  display: inline-block;
  padding: 9px 15px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.35);
  color: #86efac;
  font-weight: 800;
  margin-bottom: 24px;
}

.left-panel h1 {
  font-size: clamp(42px, 5.5vw, 72px);
  line-height: 1.05;
  margin: 0;
  letter-spacing: -2px;
}

.left-panel h1 span {
  background: linear-gradient(135deg, #22c55e, #60a5fa, #c084fc);
  -webkit-background-clip: text;
  color: transparent;
}

.left-panel > p {
  max-width: 680px;
  color: #cbd5e1;
  font-size: 18px;
  line-height: 1.8;
  margin: 24px 0;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin: 30px 0;
}

.feature-list div {
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid #334155;
  border-radius: 20px;
  padding: 18px;
  transition: 0.3s ease;
}

.feature-list div:hover {
  transform: translateY(-8px);
  border-color: #3b82f6;
}

.feature-list span {
  font-size: 28px;
}

.feature-list h3 {
  margin: 8px 0 5px;
}

.feature-list p {
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
}

.mini-dashboard {
  max-width: 540px;
  background: rgba(15, 23, 42, 0.82);
  border: 1px solid #334155;
  border-radius: 26px;
  padding: 22px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.32);
  animation: floatCard 4s infinite ease-in-out;
}

@keyframes floatCard {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-14px);
  }
}

.dash-header {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
}

.dash-header span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #334155;
}

.dash-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dash-row p {
  margin: 0;
  color: #cbd5e1;
}

.dash-row b {
  color: #22c55e;
  font-size: 22px;
}

.progress-bar {
  margin: 15px 0 20px;
  height: 12px;
  border-radius: 999px;
  background: #020617;
  overflow: hidden;
  border: 1px solid #334155;
}

.progress-bar span {
  display: block;
  width: 78%;
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #3b82f6);
  border-radius: 999px;
  animation: progressMove 2.5s infinite alternate ease-in-out;
}

@keyframes progressMove {
  from {
    width: 58%;
  }

  to {
    width: 78%;
  }
}

.dash-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.dash-stats div {
  background: #020617;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 14px;
}

.dash-stats h4 {
  margin: 0;
  color: #60a5fa;
}

.dash-stats p {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

.login-card {
  width: 100%;
  max-width: 500px;
  justify-self: end;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid #334155;
  border-radius: 32px;
  padding: 34px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 35px 85px rgba(0, 0, 0, 0.45);
  animation: slideInRight 0.8s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(40px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.card-glow {
  position: absolute;
  width: 180px;
  height: 180px;
  background: #2563eb;
  filter: blur(90px);
  opacity: 0.25;
  top: -40px;
  right: -40px;
}

.login-header {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-bottom: 28px;
}

.login-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 15px;
  border-radius: 22px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  box-shadow: 0 18px 35px rgba(37, 99, 235, 0.35);
}

.login-header h2 {
  margin: 0;
  font-size: 32px;
}

.login-header p {
  margin: 8px 0 0;
  color: #94a3b8;
}

form {
  position: relative;
  z-index: 1;
}

label {
  display: block;
  margin: 16px 0 8px;
  font-weight: 800;
  color: #f8fafc;
}

.input-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #020617;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 0 14px;
  transition: 0.25s ease;
}

.input-box:focus-within {
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.12);
}

.input-box span {
  font-size: 20px;
}

.input-box input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #f8fafc;
  padding: 16px 0;
  font-size: 15px;
}

.input-box input::placeholder {
  color: #64748b;
}

.eye-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
}

.login-submit {
  width: 100%;
  margin-top: 24px;
  border: none;
  border-radius: 18px;
  padding: 16px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  font-weight: 900;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 18px 35px rgba(37, 99, 235, 0.35);
  transition: 0.25s ease;
}

.login-submit:hover,
.create-btn:hover {
  transform: translateY(-3px);
}

.login-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
  color: #94a3b8;
}

.divider span {
  flex: 1;
  height: 1px;
  background: #334155;
}

.divider p {
  margin: 0;
  font-size: 14px;
}

.create-btn {
  width: 100%;
  border: 1px solid #334155;
  border-radius: 18px;
  padding: 15px;
  background: #111827;
  color: #f8fafc;
  font-weight: 900;
  cursor: pointer;
  transition: 0.25s ease;
}

@media (max-width: 1050px) {
  .login-page {
    overflow-y: auto;
  }

  .login-layout {
    grid-template-columns: 1fr;
  }

  .login-card {
    justify-self: center;
  }

  .left-panel {
    text-align: center;
  }

  .left-panel > p,
  .mini-dashboard {
    margin-left: auto;
    margin-right: auto;
  }
}

@media (max-width: 650px) {
  .login-page {
    overflow-y: auto;
  }

  .top-nav {
    flex-direction: column;
    gap: 16px;
  }

  .login-layout {
    padding: 25px 20px 50px;
  }

  .feature-list {
    grid-template-columns: 1fr;
  }

  .dash-stats {
    grid-template-columns: 1fr;
  }

  .login-card {
    padding: 24px;
  }
}
`;

export default Login;