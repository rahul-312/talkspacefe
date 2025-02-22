// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; 
import Login from "./pages/Login/Login";       
import Register from "./pages/Register/Register";

function App() {
  return (
    <Router>
      <div>
        <Navbar /> {/* Always visible Navbar */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
