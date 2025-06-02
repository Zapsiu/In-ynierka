import React from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Panel zawodów robotów</h1>

      <div style={{ display: "flex", gap: "2rem" }}>
        <div>
          <h2>Rejestracja</h2>
          <RegisterForm />
        </div>

        <div>
          <h2>Logowanie</h2>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default App;
