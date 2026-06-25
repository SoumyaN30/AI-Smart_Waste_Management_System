import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={styles.nav}>
      <h2>Municipal System</h2>

      <div>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/login" style={styles.link}>Login</Link>
        <Link to="/register" style={styles.link}>Register</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    padding: "15px 30px",
    display: "flex",
    justifyContent: "space-between",
    background: "#d8f3dc"
  },

  link: {
    marginLeft: "15px",
    textDecoration: "none",
    color: "#222"
  }
};

export default Navbar;