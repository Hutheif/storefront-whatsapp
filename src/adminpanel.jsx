import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
  });
  const [editImageFile, setEditImageFile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Pagination
  const PRODUCTS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });
    if (error) console.error("Error fetching products:", error);
    else setProducts(data);
  }

  // Upload image to Supabase
  async function uploadImage(file) {
    if (!file) return null;
    setUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(`public/${fileName}`, file);

    if (error) {
      console.error("Image upload failed:", error.message);
      alert("Image upload failed: " + error.message);
      setUploading(false);
      return null;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(`public/${fileName}`);
    setUploading(false);
    return data.publicUrl;
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Duplicate check helper
  const isDuplicateProduct = async ({ name, description, price, image }) => {
    const lowerName = name.trim().toLowerCase();
    const lowerDesc = description.trim().toLowerCase();
    const lowerPrice = parseFloat(price);

    for (let p of products) {
      const existingName = p.name.trim().toLowerCase();
      const existingDesc = p.description.trim().toLowerCase();
      const existingPrice = parseFloat(p.price);
      const existingImage = p.image || "";

      const imageMatch =
        (image && image === existingImage) ||
        (imageFile && imageFile.name === existingImage.split("/").pop());

      if (
        lowerName === existingName &&
        lowerDesc === existingDesc &&
        lowerPrice === existingPrice &&
        imageMatch
      ) {
        return p;
      }
    }
    return null;
  };

  // Add product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = form.image;

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const duplicate = await isDuplicateProduct({ ...form, image: imageUrl });
      if (duplicate) {
        alert("This product already exists! Edit it below.");
        openEditModal(duplicate);
        setLoading(false);
        return;
      }

      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        image: imageUrl || null,
      };

      const { error } = await supabase.from("products").insert([productData]);
      if (error) throw error;

      setForm({ name: "", description: "", price: "", image: "" });
      setImageFile(null);
      await fetchProducts();
      alert("Product added!");
    } catch (err) {
      console.error(err.message);
      alert("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image || "",
    });
    setEditImageFile(null);
    setModalOpen(true);
  };

  // Update product
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = editForm.image;

      if (editImageFile) {
        const uploadedUrl = await uploadImage(editImageFile);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const productData = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price: parseFloat(editForm.price),
        image: imageUrl || null,
      };

      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);
      if (error) throw error;

      await fetchProducts();
      setModalOpen(false);
      alert("Product updated!");
    } catch (err) {
      console.error(err.message);
      alert("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert("Failed to delete product");
    else {
      // Refill deleted product space
      const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
      if (
        (currentPage - 1) * PRODUCTS_PER_PAGE >= products.length - 1 &&
        currentPage > 1
      ) {
        setCurrentPage(currentPage - 1);
      }
      await fetchProducts();
    }
  };

  // Pagination
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      String(p.price).includes(q)
    );
  });
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-purple-900 text-white flex flex-col items-center py-8 px-4">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 p-3 rounded-lg w-full max-w-lg text-black bg-white/20 backdrop-blur-md placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-neon-purple transition shadow-md"
      />

      <h1 className="text-3xl font-bold mb-6 text-neon-purple">
        🛍️ Admin Panel - Manage Products
      </h1>

      {/* Add Product Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-purple-800 shadow-lg rounded-xl p-6 w-full max-w-lg mb-8"
      >
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product Name"
          required
          className="w-full border border-purple-600 rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          required
          className="w-full border border-purple-600 rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
        />
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          required
          step="0.01"
          className="w-full border border-purple-600 rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
        />
        <input
          type="text"
          name="image"
          value={form.image}
          onChange={handleChange}
          placeholder="Image URL (optional if uploading)"
          className="w-full border border-purple-600 rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="w-full border border-purple-600 rounded-lg p-2 mb-3 bg-purple-700 text-white"
        />
        {uploading && (
          <div className="mb-3 text-center animate-pulse">
            Uploading Image...
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 text-white rounded-lg px-4 py-2 w-full hover:bg-purple-700 transition"
        >
          {loading ? "Saving..." : "Add Product"}
        </button>
      </form>

      {/* Product Grid */}
      <div className="grid gap-6 w-full max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4">
        {displayedProducts.map((product) => (
          <div
            key={product.id}
            className="bg-purple-800 shadow-lg rounded-xl overflow-hidden border border-purple-600 hover:shadow-neon transition"
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-purple-700 flex items-center justify-center text-gray-300">
                No Image
              </div>
            )}
            <div className="p-4">
              <h2 className="font-semibold text-lg">{product.name}</h2>
              <p className="text-gray-300">{product.description}</p>
              <p className="text-neon-purple font-bold mt-2">
                Ksh {product.price}
              </p>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => openEditModal(product)}
                  className="bg-yellow-400 text-black px-3 py-1 rounded-lg hover:bg-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mb-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            disabled={currentPage === 1}
          >
            Back
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-800 p-6 rounded-xl w-full max-w-lg shadow-lg relative">
            <h2 className="text-xl font-bold mb-4 text-neon-purple">
              Edit Product
            </h2>
            <form onSubmit={handleUpdate}>
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                placeholder="Product Name"
                required
                className="w-full border border-purple-600 rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
              />
              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                placeholder="Description"
                required
                className="w-full border border-purple-600 rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
              />
              <input
                type="number"
                name="price"
                value={editForm.price}
                onChange={handleEditChange}
                placeholder="Price"
                required
                step="0.01"
                className="w-full border border-purple-600 rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
              />
              <input
                type="text"
                name="image"
                value={editForm.image}
                onChange={handleEditChange}
                placeholder="Image URL (optional if uploading)"
                className="w-full border border-purple-600 rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditImageFile(e.target.files[0])}
                className="w-full border border-purple-600 rounded-lg p-2 mb-3 bg-purple-700 text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
