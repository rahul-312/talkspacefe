import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import FriendList from "./pages/FriendList/FriendList";
import AddFriend from "./pages/AddFriend/AddFriend";
import ChatRoomList from "./pages/ChatRoomList/ChatRoomList";
import ChatRoomDetail from "./pages/ChatRoom/ChatRoom";
import Profile from "./pages/Profile/Profile";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import { ROUTES } from "./routes";

import "./App.css";

function App() {
  return (
    // basename lets the app live under a sub-path (PUBLIC_URL from "homepage")
    <Router basename={process.env.PUBLIC_URL || "/"}>
      <div className="app-container">
        <Navbar />
        <main className="content">
          <Routes>
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route element={<PublicOnlyRoute />}>
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
              <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.FRIEND_LIST} element={<FriendList />} />
              <Route path={ROUTES.ADD_FRIEND} element={<AddFriend />} />
              <Route path={ROUTES.CHATROOMS} element={<ChatRoomList />} />
              <Route path={ROUTES.CHATROOM} element={<ChatRoomDetail />} />
              <Route path={ROUTES.PROFILE} element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
