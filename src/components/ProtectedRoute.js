import { Navigate, Outlet, useLocation } from "react-router-dom";
import { clearAuth, isAuthenticated } from "../api";
import { ROUTES } from "../routes";

// Renders child routes only while the session's refresh token is valid.
export const ProtectedRoute = () => {
  const location = useLocation();
  if (!isAuthenticated()) {
    clearAuth();
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

// Login/register/reset pages: send signed-in users to the dashboard instead.
export const PublicOnlyRoute = () => {
  if (isAuthenticated()) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return <Outlet />;
};
