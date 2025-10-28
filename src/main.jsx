import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import AdminLogin from "./AdminLogin"; // ✅ Import the admin login wrapper
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Main frontend */}
        <Route path="/" element={<App />} />

        {/* Secure Admin route with password */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* Optional: handle unknown routes */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen text-center text-xl text-gray-700">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
