import { useState } from "react";
import AdminPanel from "./AdminPanel.jsx";

export default function AdminRoute() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "Ann123") {
      setAuthenticated(true);
    } else {
      alert("Incorrect password. Try again.");
    }
  };

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <form
          onSubmit={handleLogin}
          className="p-6 bg-white shadow-xl rounded-2xl flex flex-col gap-3 w-80"
        >
          <h2 className="text-xl font-semibold text-center text-gray-700">
            Admin Access
          </h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Admin Password"
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return <AdminPanel />;
}
