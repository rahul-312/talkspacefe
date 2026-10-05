// Single source of truth for client-side route paths.
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:uid/:token',
  DASHBOARD: '/dashboard',
  FRIEND_LIST: '/friend-list',
  ADD_FRIEND: '/add-friend',
  CHATROOMS: '/chatrooms',
  CHATROOM: '/chatrooms/:id',
  PROFILE: '/profile',
};

export const chatRoomPath = (id) => `${ROUTES.CHATROOMS}/${encodeURIComponent(id)}`;

// Pages reachable without signing in (reset links carry a dynamic suffix).
export const isPublicPath = (pathname) =>
  [ROUTES.HOME, ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD].includes(pathname) ||
  pathname.startsWith('/reset-password/');
