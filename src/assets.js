// Files served from /public. Prefixing PUBLIC_URL keeps them working when the
// app is deployed under a sub-path (set "homepage" in package.json).
const PUBLIC_URL = process.env.PUBLIC_URL || '';

export const DEFAULT_AVATAR = `${PUBLIC_URL}/default-profile.png`;
export const DEFAULT_GROUP_AVATAR = `${PUBLIC_URL}/default-group.png`;
export const LOGIN_ILLUSTRATION = `${PUBLIC_URL}/images/login-illustration.jpg`;

// <img onError> handler: swap in the default avatar once, never loop.
export const fallbackToDefaultAvatar = (e) => {
  if (!e.target.src.endsWith(DEFAULT_AVATAR)) {
    e.target.src = DEFAULT_AVATAR;
  }
};
