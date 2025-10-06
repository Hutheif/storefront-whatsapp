import React, { useEffect, useState } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/catalog")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10">Loading products...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-center text-3xl font-bold text-blue-600 mb-6">
        🛍️ Kakuma Wholesale
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-gray-100 shadow-lg rounded-xl overflow-hidden p-4 hover:shadow-2xl transition"
          >
            <img
              src={p.image || "https://via.placeholder.com/400"}
              alt={p.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            <h2 className="text-lg font-semibold mt-2">{p.name}</h2>
            <p className="text-green-600 font-bold">{p.price || ""}</p>
            <p className="text-sm text-gray-600 mt-1">{p.description}</p>

            <a
              href={p.waLink}
              target="_blank"
              className="mt-3 inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              💬 Chat on WhatsApp
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
