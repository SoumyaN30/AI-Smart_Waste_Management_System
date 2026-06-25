import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <style>{styles}</style>

      <nav className="navbar">
        <div className="brand">
          <div className="logo">SW</div>
          <div>
            <h2>Smart Waste</h2>
            <p>AI Waste Management System</p>
          </div>
        </div>

        <div className="nav-actions">
          <button onClick={() => navigate("/login")} className="login-btn">
            Login
          </button>
          <button onClick={() => navigate("/register")} className="register-btn">
            Register
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="animated-bg">
          <span className="blob blob1"></span>
          <span className="blob blob2"></span>
          <span className="blob blob3"></span>
        </div>

        <div className="hero-left">
          <div className="badge">🌱 Smart City • Clean Environment</div>

          <h1>
            AI-Powered Smart Waste <span>Management System</span>
          </h1>

          <p className="hero-text">
            A modern digital platform that connects citizens, workers and admins
            to manage waste pickup requests, complaints, worker notices,
            analytics and route-based service tracking efficiently.
          </p>

          <div className="hero-buttons">
            <button onClick={() => navigate("/register")} className="primary-btn">
              Get Started
            </button>
            <button onClick={() => navigate("/login")} className="secondary-btn">
              Login to Dashboard
            </button>
          </div>

          <div className="mini-stats">
            <div>
              <h3>3</h3>
              <p>User Roles</p>
            </div>
            <div>
              <h3>24/7</h3>
              <p>Request Tracking</p>
            </div>
            <div>
              <h3>AI</h3>
              <p>Smart Analytics</p>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="dashboard-card floating">
            <div className="card-header">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <h3>Live Waste Dashboard</h3>

            <div className="status-row">
              <p>Household Garbage</p>
              <span className="green">Completed</span>
            </div>

            <div className="status-row">
              <p>Choked Drain</p>
              <span className="orange">Pending</span>
            </div>

            <div className="status-row">
              <p>Gutter Overflow</p>
              <span className="blue">Accepted</span>
            </div>

            <div className="chart">
              <div style={{ height: "70%" }}></div>
              <div style={{ height: "45%" }}></div>
              <div style={{ height: "85%" }}></div>
              <div style={{ height: "55%" }}></div>
              <div style={{ height: "95%" }}></div>
            </div>
          </div>

          <div className="orbit orbit1">🗑️</div>
          <div className="orbit orbit2">♻️</div>
          <div className="orbit orbit3">📍</div>
        </div>
      </section>

      <section className="features">
        <div className="section-title">
          <h2>Project Features</h2>
          <p>Everything needed for a smart municipal waste management system.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <span>👤</span>
            <h3>Citizen Portal</h3>
            <p>
              Citizens can register, submit waste requests, raise complaints,
              attach images and track request status.
            </p>
          </div>

          <div className="feature-card">
            <span>👷</span>
            <h3>Worker Dashboard</h3>
            <p>
              Workers can view department-based tasks, accept requests, complete
              work and handle admin notices.
            </p>
          </div>

          <div className="feature-card">
            <span>🛡️</span>
            <h3>Admin Control</h3>
            <p>
              Admin can monitor all requests, send notices, manage complaints
              and view system analytics.
            </p>
          </div>

          <div className="feature-card">
            <span>📊</span>
            <h3>Analytics</h3>
            <p>
              Area-wise requests, daily trends, complaint trends and waste type
              distribution are shown visually.
            </p>
          </div>

          <div className="feature-card">
            <span>📍</span>
            <h3>Map Location</h3>
            <p>
              Users can select location on map and workers can open route to the
              service location.
            </p>
          </div>

          <div className="feature-card">
            <span>🤖</span>
            <h3>AI Ready</h3>
            <p>
              The system can be extended with waste classification and smart
              prediction features.
            </p>
          </div>
        </div>
      </section>

      <section className="workflow">
        <div className="section-title">
          <h2>How It Works</h2>
          <p>A simple digital flow from citizen request to service completion.</p>
        </div>

        <div className="timeline">
          <div className="step">
            <div>1</div>
            <h3>Citizen Raises Request</h3>
            <p>Citizen selects category, enters area, attaches media and submits.</p>
          </div>

          <div className="line"></div>

          <div className="step">
            <div>2</div>
            <h3>Worker Accepts Task</h3>
            <p>Only the respective department worker can see and accept it.</p>
          </div>

          <div className="line"></div>

          <div className="step">
            <div>3</div>
            <h3>Admin Tracks Progress</h3>
            <p>Admin views status, analytics and sends notices when required.</p>
          </div>

          <div className="line"></div>

          <div className="step">
            <div>4</div>
            <h3>Request Completed</h3>
            <p>Worker marks task completed and analytics update automatically.</p>
          </div>
        </div>
      </section>

      <section className="roles">
        <div className="role-card citizen">
          <h3>Citizen</h3>
          <p>Raise requests and complaints</p>
        </div>

        <div className="role-card worker">
          <h3>Worker</h3>
          <p>Accept and complete assigned work</p>
        </div>

        <div className="role-card admin">
          <h3>Admin</h3>
          <p>Monitor, analyze and control system</p>
        </div>
      </section>

      <footer>
        <p>© 2026 Smart Waste Management System</p>
        <p>Designed for cleaner, smarter and sustainable cities.</p>
      </footer>
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

.home-page {
  min-height: 100vh;
  background: #020617;
  color: #f8fafc;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  overflow-x: hidden;
}

.navbar {
  width: 100%;
  padding: 22px 7%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(2, 6, 23, 0.82);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  position: sticky;
  top: 0;
  z-index: 20;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
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

.nav-actions {
  display: flex;
  gap: 12px;
}

.login-btn,
.register-btn,
.primary-btn,
.secondary-btn {
  border: none;
  border-radius: 14px;
  padding: 12px 18px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.25s ease;
}

.login-btn {
  background: #111827;
  color: #f8fafc;
  border: 1px solid #334155;
}

.register-btn,
.primary-btn {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.35);
}

.secondary-btn {
  background: #111827;
  color: #cbd5e1;
  border: 1px solid #334155;
}

.login-btn:hover,
.register-btn:hover,
.primary-btn:hover,
.secondary-btn:hover {
  transform: translateY(-3px);
}

.hero {
  min-height: 88vh;
  padding: 80px 7%;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 60px;
  align-items: center;
  position: relative;
}

.animated-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.blob {
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.35;
  animation: moveBlob 9s infinite alternate ease-in-out;
}

.blob1 {
  background: #2563eb;
  top: 8%;
  left: 8%;
}

.blob2 {
  background: #22c55e;
  bottom: 12%;
  right: 8%;
  animation-delay: 2s;
}

.blob3 {
  background: #8b5cf6;
  top: 22%;
  right: 30%;
  animation-delay: 4s;
}

@keyframes moveBlob {
  from {
    transform: translate(0, 0) scale(1);
  }
  to {
    transform: translate(60px, -45px) scale(1.18);
  }
}

.hero-left,
.hero-right {
  position: relative;
  z-index: 2;
}

.badge {
  display: inline-block;
  padding: 9px 15px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.35);
  color: #86efac;
  font-weight: 800;
  margin-bottom: 24px;
}

.hero h1 {
  font-size: clamp(42px, 6vw, 76px);
  line-height: 1.05;
  margin: 0;
  letter-spacing: -2px;
}

.hero h1 span {
  background: linear-gradient(135deg, #22c55e, #60a5fa, #c084fc);
  -webkit-background-clip: text;
  color: transparent;
}

.hero-text {
  max-width: 680px;
  color: #cbd5e1;
  font-size: 18px;
  line-height: 1.8;
  margin: 24px 0;
}

.hero-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 34px;
}

.mini-stats {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.mini-stats div {
  min-width: 130px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid #334155;
  border-radius: 20px;
  padding: 16px;
}

.mini-stats h3 {
  margin: 0;
  font-size: 28px;
  color: #60a5fa;
}

.mini-stats p {
  margin: 4px 0 0;
  color: #94a3b8;
}

.hero-right {
  min-height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashboard-card {
  width: min(420px, 100%);
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid #334155;
  border-radius: 30px;
  padding: 24px;
  box-shadow: 0 35px 80px rgba(0, 0, 0, 0.45);
}

.floating {
  animation: floatingCard 4s ease-in-out infinite;
}

@keyframes floatingCard {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-18px) rotate(1deg);
  }
}

.card-header {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.card-header span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #334155;
}

.status-row {
  display: flex;
  justify-content: space-between;
  background: #020617;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 14px;
  margin: 12px 0;
}

.status-row p {
  margin: 0;
  color: #cbd5e1;
}

.status-row span {
  font-size: 12px;
  font-weight: 900;
  border-radius: 999px;
  padding: 5px 9px;
}

.green {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.14);
}

.orange {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.14);
}

.blue {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.14);
}

.chart {
  height: 140px;
  display: flex;
  align-items: end;
  gap: 14px;
  margin-top: 24px;
}

.chart div {
  flex: 1;
  border-radius: 12px 12px 0 0;
  background: linear-gradient(180deg, #22c55e, #2563eb);
  animation: barPulse 2s infinite alternate ease-in-out;
}

.chart div:nth-child(2) {
  animation-delay: 0.3s;
}

.chart div:nth-child(3) {
  animation-delay: 0.6s;
}

.chart div:nth-child(4) {
  animation-delay: 0.9s;
}

@keyframes barPulse {
  from {
    opacity: 0.6;
    transform: scaleY(0.9);
  }
  to {
    opacity: 1;
    transform: scaleY(1.05);
  }
}

.orbit {
  position: absolute;
  width: 64px;
  height: 64px;
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
  animation: orbitMove 5s infinite ease-in-out;
}

.orbit1 {
  top: 45px;
  right: 40px;
}

.orbit2 {
  bottom: 75px;
  left: 40px;
  animation-delay: 1s;
}

.orbit3 {
  top: 170px;
  left: 20px;
  animation-delay: 2s;
}

@keyframes orbitMove {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-18px);
  }
}

.features,
.workflow,
.roles {
  padding: 80px 7%;
}

.section-title {
  text-align: center;
  margin-bottom: 42px;
}

.section-title h2 {
  font-size: 40px;
  margin: 0;
}

.section-title p {
  color: #94a3b8;
  margin-top: 10px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 22px;
}

.feature-card {
  background: #111827;
  border: 1px solid #334155;
  border-radius: 26px;
  padding: 26px;
  transition: 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent, rgba(59, 130, 246, 0.12));
  opacity: 0;
  transition: 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
  border-color: #3b82f6;
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-card span {
  font-size: 38px;
}

.feature-card h3 {
  font-size: 22px;
  margin-bottom: 10px;
  position: relative;
}

.feature-card p {
  color: #cbd5e1;
  line-height: 1.7;
  position: relative;
}

.timeline {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
  gap: 18px;
  align-items: center;
}

.step {
  background: #111827;
  border: 1px solid #334155;
  border-radius: 24px;
  padding: 24px;
  min-height: 190px;
  transition: 0.3s ease;
}

.step:hover {
  transform: scale(1.04);
}

.step div {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.step p {
  color: #cbd5e1;
  line-height: 1.6;
}

.line {
  width: 55px;
  height: 3px;
  background: linear-gradient(90deg, #2563eb, #22c55e);
  border-radius: 999px;
  animation: lineGlow 1.8s infinite alternate ease-in-out;
}

@keyframes lineGlow {
  from {
    opacity: 0.4;
  }
  to {
    opacity: 1;
    box-shadow: 0 0 20px #22c55e;
  }
}

.roles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.role-card {
  border-radius: 28px;
  padding: 34px;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: end;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.28);
  transition: 0.3s ease;
}

.role-card:hover {
  transform: translateY(-10px) rotate(1deg);
}

.role-card h3 {
  font-size: 30px;
  margin: 0;
}

.role-card p {
  margin-bottom: 0;
  color: #e2e8f0;
}

.citizen {
  background: linear-gradient(135deg, #2563eb, #0f172a);
}

.worker {
  background: linear-gradient(135deg, #16a34a, #0f172a);
}

.admin {
  background: linear-gradient(135deg, #7c3aed, #0f172a);
}

footer {
  padding: 28px 7%;
  border-top: 1px solid #334155;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  color: #94a3b8;
}

@media (max-width: 950px) {
  .hero {
    grid-template-columns: 1fr;
    padding-top: 50px;
  }

  .timeline {
    grid-template-columns: 1fr;
  }

  .line {
    width: 3px;
    height: 45px;
    margin: auto;
  }

  .navbar {
    flex-direction: column;
    gap: 18px;
  }
}

@media (max-width: 560px) {
  .nav-actions {
    width: 100%;
  }

  .login-btn,
  .register-btn {
    flex: 1;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
  }
}
`;

export default Home;