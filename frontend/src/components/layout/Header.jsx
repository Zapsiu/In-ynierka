import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../../AppStyles.css";
import ChatModal from "../chat/ChatModal";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    setIsLoggedIn(!!token);
    setRole(userRole);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/logowanie");
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <Link to="/" className="logo-link">EastRobo</Link>
        </div>
        <nav className="nav">
          <Link to="/regulamin" className="nav-button">Regulamin</Link>
          <Link to="/grupy" className="nav-button">Grupy</Link>
          <Link to="/playoff" className="nav-button">Play-off</Link>

          {isLoggedIn ? (
            <>
              {role === "judge" && <Link to="/sedzia" className="nav-button">Sędzia</Link>}
              {role === "admin" && (
                <>
                  <Link to="/admin" className="nav-button">Admin</Link>
                  <Link to="/sedzia" className="nav-button">Sędzia</Link>
                </>
              )}
              <ChatModal role={role || 'user'} initialStaffUsernames={[]} />
              <Link to="/profil" className="nav-button">Profil</Link>
              <Link to="/druzyna" className="nav-button">Drużyna</Link>
              <button onClick={handleLogout} className="nav-button">Wyloguj</button>
            </>
          ) : (
            <>
              <Link to="/rejestracja" className="nav-button">Rejestracja</Link>
              <Link to="/logowanie" className="nav-button">Logowanie</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
