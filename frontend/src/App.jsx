import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profil";
import Team from "./pages/Team";
import "./AppStyles.css";
import AdminPanel from "./pages/AdminPanel"; 
import JudgePanel from "./pages/JudgePanel"; 
import Regulation from "./pages/Regulation";
import RegulationView from "./pages/RegulationView";
import Groups from "./pages/Groups";
import Playoff from "./pages/Playoff";
import Footer from "./components/layout/Footer";
function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/regulamin" element={<Regulation />} />
        <Route path="/regulamin/:id" element={<RegulationView />} />
        <Route path="/logowanie" element={<Login />} />
        <Route path="/rejestracja" element={<Register />} />
        <Route path="/grupy" element={<Groups />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="/druzyna" element={<Team />} /> 
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/sedzia" element={<JudgePanel />} />
        <Route path="/playoff" element={<Playoff />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
