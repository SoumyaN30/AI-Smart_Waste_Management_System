import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import WorkerDashboard from "./pages/WorkerDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Common dashboard route */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Worker dashboard route */}
        <Route path="/worker-dashboard" element={<WorkerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;