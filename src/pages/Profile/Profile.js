import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserDetails,
  updateUserDetails,
  deactivateAccount,
  clearAuth,
  errorMessage,
  mediaUrl,
} from "../../api";
import { validateImageFile } from "../../utils/validation";
import { ROUTES } from "../../routes";
import { fallbackToDefaultAvatar } from "../../assets";
import Swal from "sweetalert2";
import "./Profile.css";

const EDITABLE_FIELDS = ["first_name", "last_name", "phone_number"];

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
      const fileError = validateImageFile(file);
      if (fileError) {
        Swal.fire({
          icon: "error",
          title: "Invalid File",
          text: fileError,
          confirmButtonColor: "#e74c3c",
        });
        e.target.value = "";
        return;
      }
      const fileUrl = URL.createObjectURL(file);
      setProfilePictureFile(file);
      setFormData((prev) => {
        if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return { ...prev, previewUrl: fileUrl };
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    // Only send fields the user can actually edit here, never echo back
    // server-owned fields (id, flags, etc.) from the fetched profile.
    const updateData = new FormData();
    EDITABLE_FIELDS.forEach((key) => {
      const value = formData[key];
      if (value !== null && value !== undefined) {
        updateData.append(key, String(value).trim());
      }
    });
    if (profilePictureFile && profilePictureFile instanceof File) {
      updateData.append("profile_picture", profilePictureFile, profilePictureFile.name);
    }
    try {
      const response = await updateUserDetails(updateData);
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
        text: errorMessage(err, "Failed to update profile."),
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
        await deactivateAccount();
        clearAuth();
        Swal.fire({
          icon: "success",
          title: "Account Deactivated",
          text: "Your account has been deactivated. Redirecting to login...",
          confirmButtonColor: "#4a90e2",
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          navigate(ROUTES.LOGIN, { replace: true });
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

  // Leave edit mode and discard unsaved changes.
  const handleClose = () => {
    if (formData.previewUrl) URL.revokeObjectURL(formData.previewUrl);
    const { profile_picture, ...rest } = userData;
    setFormData(rest);
    setProfilePictureFile(null);
    setEditMode(false);
  };

  if (!userData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  const fullName = `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || "Your name";

  const getImageSrc = () => {
    if (formData.previewUrl) {
      return formData.previewUrl;
    }
    return mediaUrl(userData.profile_picture);
  };

  return (
    <div className="page-center profile-page">
      <div className="card profile-card">
        {editMode && (
          <button
            type="button"
            className="close-btn"
            onClick={handleClose}
            aria-label="Cancel editing"
            title="Cancel editing"
          >
            ✕
          </button>
        )}
        <div className="profile-header">
          <img
            src={getImageSrc()}
            alt=""
            className="profile-pic"
            onError={fallbackToDefaultAvatar}
          />
          <h1>{fullName}</h1>
          <p className="profile-email">{userData.email}</p>
        </div>
        {editMode ? (
          <form onSubmit={handleUpdate} className="profile-form">
            <div className="form-group">
              <label htmlFor="profile-first-name">First Name</label>
              <input
                id="profile-first-name"
                type="text"
                name="first_name"
                maxLength={150}
                autoComplete="given-name"
                value={formData.first_name || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-last-name">Last Name</label>
              <input
                id="profile-last-name"
                type="text"
                name="last_name"
                maxLength={150}
                autoComplete="family-name"
                value={formData.last_name || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-email">Email account</label>
              <input id="profile-email" type="email" value={formData.email || ""} disabled />
            </div>
            <div className="form-group">
              <label htmlFor="profile-phone">Mobile number</label>
              <input
                id="profile-phone"
                type="text"
                name="phone_number"
                maxLength={20}
                autoComplete="tel"
                value={formData.phone_number || ""}
                onChange={handleInputChange}
                placeholder="Add number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-picture">Profile Picture</label>
              <input
                id="profile-picture"
                type="file"
                name="profile_picture"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif"
              />
            </div>
            <div className="profile-actions">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="detail-row">
              <span>Name</span>
              <span>{fullName}</span>
            </div>
            <div className="detail-row">
              <span>Email account</span>
              <span>{userData.email}</span>
            </div>
            <div className="detail-row">
              <span>Mobile number</span>
              <span>{userData.phone_number || "Not added"}</span>
            </div>
            <div className="detail-row">
              <span>Gender</span>
              <span>{userData.gender || "Not specified"}</span>
            </div>
            <div className="profile-actions">
              <button type="button" className="btn btn-primary" onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDeactivate}>
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
