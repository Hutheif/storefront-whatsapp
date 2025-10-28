import React, { useState } from "react";
import AdminPanel from "./AdminPanel";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    const ADMIN_PASSWORD = "Ann123"; // ✅ Change this to your private password

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password. Try again!");
    }
  };

  if (isAuthenticated) {
    return <AdminPanel />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-6">🔒 Admin Login</h1>
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 bg-gray-800 p-8 rounded-2xl shadow-lg"
      >
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
}
