import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserDetails, api, API } from "../../api";
import Swal from "sweetalert2";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUserDetails();
        setUserData(response.data);
        // Exclude profile_picture from formData to avoid string URL
        const { profile_picture, ...rest } = response.data;
        setFormData(rest);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to load profile data.",
          confirmButtonColor: "#e74c3c",
        });
        console.error(err);
      }
    };
    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!validTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Invalid File",
          text: "Please upload a valid image file (JPEG, PNG, or GIF)",
          confirmButtonColor: "#e74c3c",
        });
        return;
      }
      if (file.size > maxSize) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Image size must be less than 5MB",
          confirmButtonColor: "#e74c3c",
        });
        return;
      }
      const fileUrl = URL.createObjectURL(file);
      setProfilePictureFile(file);
      setFormData((prev) => ({ ...prev, previewUrl: fileUrl }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const updateData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "email" && key !== "gender" && value !== null && key !== "previewUrl") {
        updateData.append(key, value);
      }
    });
    if (profilePictureFile && profilePictureFile instanceof File) {
      updateData.append("profile_picture", profilePictureFile, profilePictureFile.name);
    }
    try {
      const response = await api.put(API.USER_DETAIL, updateData);
      setUserData(response.data);
      const { profile_picture, ...rest } = response.data;
      setFormData({ ...rest, previewUrl: null });
      setProfilePictureFile(null);
      setEditMode(false);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Profile updated successfully!",
        confirmButtonColor: "#4a90e2",
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error("Error response:", err.response?.data);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.detail || "Failed to update profile.",
        confirmButtonColor: "#e74c3c",
      });
    }
  };
  const handleDeactivate = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to deactivate your account? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#95a5a6",
      confirmButtonText: "Yes, deactivate it!",
      cancelButtonText: "No, keep it",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(API.USER_DETAIL);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        Swal.fire({
          icon: "success",
          title: "Account Deactivated",
          text: "Your account has been deactivated. Redirecting to login...",
          confirmButtonColor: "#4a90e2",
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          navigate("/login");
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Deactivation Failed",
          text: "Failed to deactivate account.",
          confirmButtonColor: "#e74c3c",
        });
        console.error(err);
      }
    }
  };

  const handleClose = () => {
    setEditMode(false);
  };

  if (!userData) return <div>Loading...</div>;

  const fullName = `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "Your name";

  const getImageSrc = () => {
    if (formData.previewUrl) {
      return formData.previewUrl;
    }
    if (userData.profile_picture) {
      return `http://127.0.0.1:8000${userData.profile_picture}`;
    }
    return "/default-profile.png";
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <button className="close-btn" onClick={handleClose}>
          ✕
        </button>
        <div className="profile-header">
          <img src={getImageSrc()} alt="Profile" className="profile-pic" />
          <h2>{fullName}</h2>
          <p className="email-icon">✉️ {userData.email}</p>
        </div>
        {editMode ? (
          <form onSubmit={handleUpdate} className="profile-form">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Email account</label>
              <input type="email" value={formData.email} disabled />
            </div>
            <div className="form-group">
              <label>Mobile number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number || ""}
                onChange={handleInputChange}
                placeholder="Add number"
              />
            </div>
            <div className="form-group">
              <label>Profile Picture:</label>
              <input
                type="file"
                name="profile_picture"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif"
              />
            </div>
            <button type="submit" className="save-btn">
              Save Change
            </button>
          </form>
        ) : (
          <div className="profile-details">
            <div className="detail-row">
              <span>Name</span>
              <span>{fullName || "Your name"}</span>
            </div>
            <div className="detail-row">
              <span>Email account</span>
              <span>{userData.email}</span>
            </div>
            <div className="detail-row">
              <span>Mobile number</span>
              <span>{userData.phone_number || "Add number"}</span>
            </div>
            <div className="detail-row">
              <span>Gender</span>
              <span>{userData.gender || "Not specified"}</span>
            </div>
            <div className="profile-actions">
              <button onClick={() => setEditMode(true)}>Edit Profile</button>
              <button onClick={handleDeactivate} className="deactivate-btn">
                Deactivate Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;