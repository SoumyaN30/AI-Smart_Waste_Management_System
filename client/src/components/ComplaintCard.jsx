const ComplaintCard = ({ complaint, role, onResolve, onDelete }) => {
  if (!complaint) return null;

  const imageUrl = complaint.image
    ? complaint.image.startsWith("http")
      ? complaint.image
      : `http://localhost:5000/uploads/${complaint.image}`
    : null;

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "status pending";
      case "resolved":
        return "status resolved";
      case "in progress":
        return "status progress";
      default:
        return "status pending";
    }
  };

  return (
    <>
      <style>
        {`
          .complaint-card {
            background: #ffffff;
            border-radius: 18px;
            padding: 20px;
            margin-bottom: 18px;
            box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
            border-left: 6px solid #bdd7ee;
          }

          .complaint-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 15px;
            margin-bottom: 12px;
          }

          .complaint-header h3 {
            margin: 0;
            color: #263238;
            font-size: 20px;
          }

          .complaint-date {
            margin: 5px 0 0;
            color: #777;
            font-size: 14px;
          }

          .complaint-body p {
            margin: 8px 0;
            color: #333;
            line-height: 1.5;
          }

          .status {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            white-space: nowrap;
          }

          .status.pending {
            background: #fff3cd;
            color: #856404;
          }

          .status.progress {
            background: #d1ecf1;
            color: #0c5460;
          }

          .status.resolved {
            background: #d4edda;
            color: #155724;
          }

          .complaint-image-box {
            margin-top: 12px;
          }

          .complaint-image {
            width: 100%;
            max-width: 350px;
            height: 220px;
            object-fit: cover;
            border-radius: 14px;
            border: 1px solid #ddd;
          }

          .complaint-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
          }

          .resolve-btn,
          .delete-btn {
            border: none;
            padding: 10px 16px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
          }

          .resolve-btn {
            background: #b8f2c2;
            color: #14532d;
          }

          .delete-btn {
            background: #f7d8d6;
            color: #7f1d1d;
          }

          .resolve-btn:hover,
          .delete-btn:hover {
            opacity: 0.85;
          }

          @media (max-width: 600px) {
            .complaint-header {
              flex-direction: column;
            }

            .complaint-image {
              max-width: 100%;
              height: 200px;
            }

            .complaint-actions {
              flex-direction: column;
            }

            .resolve-btn,
            .delete-btn {
              width: 100%;
            }
          }
        `}
      </style>

      <div className="complaint-card">
        <div className="complaint-header">
          <div>
            <h3>{complaint.title || complaint.category || "Complaint"}</h3>

            <p className="complaint-date">
              {complaint.createdAt
                ? new Date(complaint.createdAt).toLocaleDateString()
                : "Date not available"}
            </p>
          </div>

          <span className={getStatusClass(complaint.status)}>
            {complaint.status || "Pending"}
          </span>
        </div>

        <div className="complaint-body">
          <p>
            <strong>Description:</strong>{" "}
            {complaint.description || "No description provided"}
          </p>

          <p>
            <strong>Location:</strong>{" "}
            {complaint.location || complaint.address || "Not provided"}
          </p>

          {complaint.landmark && (
            <p>
              <strong>Landmark:</strong> {complaint.landmark}
            </p>
          )}

          {complaint.category && (
            <p>
              <strong>Category:</strong> {complaint.category}
            </p>
          )}

          {complaint.citizenName && (
            <p>
              <strong>Citizen:</strong> {complaint.citizenName}
            </p>
          )}

          {complaint.phone && (
            <p>
              <strong>Phone:</strong> {complaint.phone}
            </p>
          )}

          {imageUrl && (
            <div className="complaint-image-box">
              <img
                src={imageUrl}
                alt="Complaint"
                className="complaint-image"
              />
            </div>
          )}
        </div>

        <div className="complaint-actions">
          {role === "admin" && complaint.status !== "Resolved" && (
            <button
              className="resolve-btn"
              onClick={() => onResolve && onResolve(complaint._id)}
            >
              Mark as Resolved
            </button>
          )}

          {role === "admin" && (
            <button
              className="delete-btn"
              onClick={() => onDelete && onDelete(complaint._id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ComplaintCard;