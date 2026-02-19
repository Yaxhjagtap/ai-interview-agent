import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import Navbar from "./components/Navbar";

export default function App(){
  const token = localStorage.getItem("access_token");
  return (
    <div>
      <Navbar />
      <main style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={ token ? <Navigate to="/dashboard" /> : <Navigate to="/login" /> } />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview/:id" element={<Interview />} />
        </Routes>
      </main>
    </div>
  );
}
