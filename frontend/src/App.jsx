import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profil";
import Team from "./pages/Team"; // 👈 dodana strona drużyn
import "./AppStyles.css";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/logowanie" element={<Login />} />
        <Route path="/rejestracja" element={<Register />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="/druzyna" element={<Team />} /> {/* ✅ nowa trasa */}
      </Routes>
    </>
  );
}

export default App;
