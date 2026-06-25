import CitizenDashboard from "./CitizenDashboard";
import WorkerDashboard from "./WorkerDashboard";
import AdminDashboard from "./AdminDashboard";

function Dashboard() {
  const role = sessionStorage.getItem("role");

  if (role === "citizen") return <CitizenDashboard />;
  if (role === "worker") return <WorkerDashboard />;
  if (role === "admin") return <AdminDashboard />;

  return <h2 style={{ textAlign: "center" }}>Please login again</h2>;
}

export default Dashboard;