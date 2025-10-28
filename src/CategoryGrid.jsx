import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { motion } from "framer-motion";
import { FaArrowUp } from "react-icons/fa";
import { openWhatsApp } from "./utils/openWhatsApp"; // ✅ universal helper

export default function CategoryGrid({
  addToCart: addToCartProp,
  sendSingleProductWhatsApp: sendWhatsAppProp,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showHome, setShowHome] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false })
        .limit(12);
      if (error) console.error("Error fetching products:", error);
      else setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // ✅ Detect scroll bottom for Home button
  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100;
      setShowHome(bottom);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const SkeletonCard = () => (
    <div className="animate-pulse bg-[#111] rounded-2xl h-72 w-full" />
  );

  const handleAddToCart = (product) => {
    if (typeof addToCartProp === "function") {
      addToCartProp(product);
    } else {
      alert(`(Test) Added ${product.name} to cart`);
    }
  };

  // ✅ Fixed: Buy Now now opens WhatsApp app on mobile
  const handleBuyNow = (product) => {
    const message = `Hello! I'm interested in ${product.name} - KSH ${product.price}`;
    if (typeof sendWhatsAppProp === "function") {
      sendWhatsAppProp(product);
    } else {
      openWhatsApp(message);
    }
  };

  return (
    <section
      id="category-grid"
      className="min-h-screen py-16 text-white bg-gradient-to-b from-[#0f0f0f] via-[#1b1b1b] to-[#0f0f0f]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-center mb-10 text-[#ff4d94]">
          Featured Categories
        </h2>

        {/* ✅ 2-column mobile grid, 4-column desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-[#141414] rounded-2xl overflow-hidden shadow-lg hover:shadow-[#ff4d94]/30 transition"
                >
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${
                        product.image_url || product.image || ""
                      }')`,
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1">
                      {product.name}
                    </h3>
                    <p className="text-[#ff4d94] font-bold mb-3">
                      KSH {Number(product.price).toLocaleString()}
                    </p>

                    <div className="flex justify-center">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="px-4 py-2 rounded-full bg-[#ff4d94] hover:bg-[#e04484] text-white font-semibold transition"
                      >
                        See More
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>
      </div>

      {/* ✅ Product modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f0f10] rounded-2xl w-full max-w-md p-6 text-white relative"
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 text-gray-300 hover:text-white text-xl"
            >
              ✕
            </button>

            <div
              className="h-56 bg-cover bg-center rounded-lg mb-4"
              style={{
                backgroundImage: `url('${
                  selectedProduct.image_url || selectedProduct.image || ""
                }')`,
              }}
            />

            <h3 className="text-2xl font-bold mb-2">{selectedProduct.name}</h3>
            <p className="text-[#ff4d94] text-xl font-semibold mb-6">
              KSH {Number(selectedProduct.price).toLocaleString()}
            </p>

            <div className="flex flex-col md:flex-row gap-3 md:justify-end">
              <button
                onClick={() => handleAddToCart(selectedProduct)}
                className="w-full md:w-auto px-4 py-2 rounded-full bg-[#ff4d94] hover:bg-[#e04484] text-white font-semibold transition"
              >
                Add to Cart
              </button>
              <button
                onClick={() => handleBuyNow(selectedProduct)}
                className="w-full md:w-auto px-4 py-2 rounded-full border-2 border-[#ff4d94] text-[#ff4d94] hover:bg-[#ff4d94] hover:text-white transition"
              >
                Buy Now
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ✅ Floating Home button - visible & above WhatsApp icon */}
      {showHome && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className="fixed bottom-24 right-6 z-[9998] bg-[#ff4d94] text-white p-3 rounded-full shadow-lg hover:bg-[#e04484] transition"
        >
          <FaArrowUp />
        </motion.button>
      )}
    </section>
  );
}
