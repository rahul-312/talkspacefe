// Client-side checks only improve UX; the backend must enforce the same rules.

export const MIN_PASSWORD_LENGTH = 8;

// Returns an error string, or "" when the password is acceptable.
export const validatePassword = (password) => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > 128) {
    return "Password must be at most 128 characters.";
  }
  if (/^\d+$/.test(password)) {
    return "Password can't be entirely numeric.";
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Password must contain both letters and numbers.";
  }
  return "";
};

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

// Returns an error string, or "" when the file is an acceptable image.
export const validateImageFile = (file) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) || !/\.(jpe?g|png|gif)$/i.test(file.name)) {
    return "Please upload a valid image file (JPEG, PNG, or GIF)";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image size must be less than 5MB";
  }
  return "";
};
