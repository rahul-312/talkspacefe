import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import FriendList from "./pages/FriendList/FriendList";
import AddFriend from "./pages/AddFriend/AddFriend";
import Footer from "./components/Footer";
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
            <Route path="/friend-list" element={<FriendList />} /> {/* Added FriendList route */}
            <Route path="/add-friend" element={<AddFriend />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
