import { useEffect, useState } from "react";
import axios from "axios";

const CitizenProfile = () => {
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    landmark: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const token = sessionStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:5000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(res.data);

      setFormData({
        fullName: res.data.fullName || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
        landmark: res.data.landmark || "",
      });
    } catch (error) {
      console.error("Fetch Profile Error:", error);
      setMessage("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setMessage("Phone number must be exactly 10 digits");
      return;
    }

    try {
      const res = await axios.put(
        "http://localhost:5000/api/users/profile",
        {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          landmark: formData.landmark,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(res.data.user);

      setFormData({
        fullName: res.data.user.fullName || "",
        email: res.data.user.email || "",
        phone: res.data.user.phone || "",
        address: res.data.user.address || "",
        landmark: res.data.user.landmark || "",
      });

      setIsEditing(false);
      setMessage("Profile updated successfully");
    } catch (error) {
      console.error("Update Profile Error:", error);
      setMessage(error.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!profile) {
    return <p>Profile not found</p>;
  }

  return (
    <div className="profile-card">
      <div className="profile-header">
        <h2>My Profile</h2>

        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="edit-btn">
            Edit
          </button>
        )}
      </div>

      {message && <p className="profile-message">{message}</p>}

      {!isEditing ? (
        <div className="profile-details">
          <p>
            <strong>Full Name:</strong> {profile.fullName}
          </p>

          <p>
            <strong>Email:</strong> {profile.email}
          </p>

          <p>
            <strong>Phone:</strong> {profile.phone}
          </p>

          <p>
            <strong>Address:</strong> {profile.address}
          </p>

          <p>
            <strong>Landmark:</strong> {profile.landmark || "Not added"}
          </p>

          <p>
            <strong>Role:</strong> {profile.role}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="profile-form">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input type="email" name="email" value={formData.email} disabled />

          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            maxLength="10"
            required
          />

          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <label>Landmark</label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
          />

          <div className="profile-actions">
            <button type="submit" className="save-btn">
              Save Changes
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setIsEditing(false);
                setMessage("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CitizenProfile;