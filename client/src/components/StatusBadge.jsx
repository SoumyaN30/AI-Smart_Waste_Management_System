function StatusBadge({ status }) {

  const getStatusStyle = () => {

    switch (status) {

      case "pending":
        return {
          background: "#facc15",
          color: "#111827"
        };

      case "accepted":
        return {
          background: "#3b82f6",
          color: "white"
        };

      case "completed":
        return {
          background: "#22c55e",
          color: "white"
        };

      default:
        return {
          background: "#6b7280",
          color: "white"
        };
    }
  };

  return (
    <span
      style={{
        ...styles.badge,
        ...getStatusStyle()
      }}
    >
      {status}
    </span>
  );
}

const styles = {
  badge: {
    padding: "5px 12px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: "bold",
    textTransform: "capitalize",
    display: "inline-block"
  }
};

export default StatusBadge;