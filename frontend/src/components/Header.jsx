import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../AppStyles.css";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]); // odśwież przy każdej zmianie ścieżki

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/logowanie");
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <Link to="/" className="logo-link">Moja Aplikacja</Link>
        </div>
        <nav className="nav">
          {isLoggedIn ? (
            <>
              <Link to="/profil" className="nav-button">Profil</Link>
              <Link to="/druzyna" className="nav-button">Drużyna</Link>
              <button onClick={handleLogout} className="nav-button">Wyloguj</button>
            </>
          ) : (
            <>
              <Link to="/logowanie" className="nav-button">Logowanie</Link>
              <Link to="/rejestracja" className="nav-button">Rejestracja</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
