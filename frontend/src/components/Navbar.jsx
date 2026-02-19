import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar(){
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  function logout(){
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  return (
    <nav style={{ padding: 12, borderBottom: "1px solid #ddd", display:"flex", gap:12 }}>
      <Link to="/dashboard">Dashboard</Link>
      {!token && <Link to="/login">Login</Link>}
      {!token && <Link to="/register">Register</Link>}
      {token && <button onClick={logout}>Logout</button>}
    </nav>
  );
}
