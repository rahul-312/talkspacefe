import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import FriendList from "./pages/FriendList/FriendList";
import AddFriend from "./pages/AddFriend/AddFriend";
import ChatRoomList from "./pages/ChatRoomList/ChatRoomList";
import ChatRoomDetail from "./pages/ChatRoom/ChatRoom";
import Profile from "./pages/Profile/Profile"; // Import the Profile component
import "./styles/App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/friend-list" element={<FriendList />} />
            <Route path="/add-friend" element={<AddFriend />} />
            <Route path="/chatrooms" element={<ChatRoomList />} />
            <Route path="/chatrooms/:id" element={<ChatRoomDetail />} />
            <Route path="/profile" element={<Profile />} /> {/* Added Profile route */}
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;