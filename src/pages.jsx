import { motion } from "framer-motion";
import App from "../components/App"; // ✅ First hero section
import CategoryGrid from "../components/CategoryGrid"; // ✅ Second hero section
import { useState, useEffect } from "react";
import { FiHome } from "react-icons/fi";

export default function HomePage() {
  return (
    <main className="w-full overflow-x-hidden bg-black text-white">
      {/* 🦋 Hero Section #1 */}
      <section id="hero1" className="relative z-[1]">
        <App />
      </section>

      {/* 💎 Hero Section #2 */}
      <motion.section
        id="hero2"
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}
        className="relative z-[2]"
      >
        <CategoryGrid />
      </motion.section>

      {/* 🏠 Floating Home Button */}
      <ScrollToTopButton />
    </main>
  );
}

// 🏠 Home Button Component
function ScrollToTopButton() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      setShowButton(bottom);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return showButton ? (
    <button
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
      className="fixed bottom-6 right-6 bg-[#ff4d94] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-2xl text-2xl hover:scale-110 transition-all duration-300 z-[9999]"
    >
      <FiHome />
    </button>
  ) : null;
}
