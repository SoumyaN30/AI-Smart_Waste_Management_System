function RequestCard({ request, children }) {
  const mediaUrl = request.media
    ? `http://localhost:5000/uploads/${request.media}`
    : null;

  return (
    <div style={styles.card}>
      <h3>{request.category}</h3>

      <p><b>Area:</b> {request.area}</p>

      <p>
        <b>Description:</b>{" "}
        {request.description || "No description"}
      </p>

      <p>
        <b>Status:</b>{" "}
        <span style={styles.badge}>
          {request.status}
        </span>
      </p>

      {request.citizen?.name && (
        <p><b>Citizen:</b> {request.citizen.name}</p>
      )}

      {request.acceptedBy?.name && (
        <p><b>Worker:</b> {request.acceptedBy.name}</p>
      )}

      {request.createdAt && (
        <p>
          <b>Date:</b>{" "}
          {new Date(request.createdAt).toLocaleString()}
        </p>
      )}

      {mediaUrl && (
        <a href={mediaUrl} target="_blank" rel="noreferrer">
          View Attachment
        </a>
      )}

      <div style={styles.actions}>
        {children}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    padding: "18px",
    borderRadius: "18px",
    marginBottom: "16px",
    boxShadow: "0 10px 22px rgba(0,0,0,0.08)"
  },

  badge: {
    background: "#7c3aed",
    color: "white",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "14px"
  },

  actions: {
    marginTop: "12px"
  }
};

export default RequestCard;