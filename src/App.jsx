import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";
import AdminPanel from "./AdminPanel";
import { FiShoppingCart, FiX, FiSearch } from "react-icons/fi";
import styles from "./App.module.css";
import CategoryGrid from "./CategoryGrid";
import { openWhatsApp } from "./utils/openWhatsApp";

export default function App() {
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(true);
  const [isInSearchView, setIsInSearchView] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const runNextAutoRef = useRef(null);

  // ✅ Admin access check
  useEffect(() => {
    if (window.location.hash === "#admin=secret123") setIsAdmin(true);
  }, []);

  // ✅ Fetch products from Supabase ONLY
  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("❌ Error fetching products:", error);
      } else {
        setProducts(data);
        setDisplayedProducts(data);
      }
    }

    fetchProducts();

    const channel = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      clearTimeout(runNextAutoRef.current);
    };
  }, []);

  // ✅ Auto slideshow
  useEffect(() => {
    if (!isAutoPlayActive || isInSearchView || products.length === 0) return;

    runNextAutoRef.current = setTimeout(() => {
      nextProduct();
    }, 7000);

    return () => clearTimeout(runNextAutoRef.current);
  }, [currentSlideIndex, isAutoPlayActive, isInSearchView, products.length]);

  // ✅ Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(filtered);
    setShowSearchResults(true);
  }, [searchQuery, products]);

  // ✅ FIXED: Carousel Navigation
  const nextProduct = useCallback(() => {
    if (displayedProducts.length === 0) return;

    setDisplayedProducts((prev) => {
      const newProducts = [...prev];
      const firstItem = newProducts.shift();
      newProducts.push(firstItem);
      return newProducts;
    });

    setCurrentSlideIndex((prev) => (prev + 1) % displayedProducts.length);
  }, [displayedProducts.length]);

  const prevProduct = useCallback(() => {
    if (displayedProducts.length === 0) return;

    setDisplayedProducts((prev) => {
      const newProducts = [...prev];
      const lastItem = newProducts.pop();
      newProducts.unshift(lastItem);
      return newProducts;
    });

    setCurrentSlideIndex((prev) =>
      prev === 0 ? displayedProducts.length - 1 : prev - 1
    );
  }, [displayedProducts.length]);

  // ✅ FIXED: Show exact product
  const showExactProduct = useCallback(
    (productId) => {
      setIsAutoPlayActive(false);
      setIsInSearchView(true);

      const productIndex = products.findIndex((p) => p.id === productId);
      if (productIndex !== -1) {
        const reorderedProducts = [...products];
        const [selectedProduct] = reorderedProducts.splice(productIndex, 1);
        reorderedProducts.splice(1, 0, selectedProduct);
        setDisplayedProducts(reorderedProducts);
        setCurrentSlideIndex(1);
      }

      setShowSearchResults(false);
      setSearchQuery("");
      setShowSearchInput(false);
    },
    [products]
  );

  // ✅ Cart functions
  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, change) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(1, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  // ✅ WhatsApp functions
  const sendWhatsAppOrder = useCallback(() => {
    if (cart.length === 0) return;

    let message = `Hello QueensBeauty! 👋\n\n`;
    message += `I would love to place an order:\n\n`;

    let total = 0;
    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      message += `📦 ${item.name} x${
        item.quantity
      } - KSH ${itemTotal.toLocaleString()}\n`;
    });

    message += `\n💰 *Total: KSH ${total.toLocaleString()}*\n\n`;
    message += `Please confirm my order and provide delivery details. Thank you! 💖`;

    const encodedText = encodeURIComponent(message);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `whatsapp://send?phone=254714137554&text=${encodedText}`;
    } else {
      const webUrl = `https://web.whatsapp.com/send?phone=254714137554&text=${encodedText}`;
      window.open(webUrl, "_blank", "width=800,height=600");
    }
  }, [cart]);

  const sendSingleProductWhatsApp = useCallback((product) => {
    let message = `Hello QueensBeauty! 👋\n\n`;
    message += `I would love to purchase:\n`;
    message += `📦 *${product.name}*\n`;
    message += `💰 Price: KSH ${product.price.toLocaleString()}\n\n`;
    message += `Is this product available? Please let me know the delivery process and payment options.\n\n`;
    message += `Thank you! 💖`;

    const encodedText = encodeURIComponent(message);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `whatsapp://send?phone=254714137554&text=${encodedText}`;
    } else {
      const webUrl = `https://web.whatsapp.com/send?phone=254714137554&text=${encodedText}`;
      window.open(webUrl, "_blank", "width=800,height=600");
    }
  }, []);

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  if (isAdmin) return <AdminPanel />;

  return (
    <div className="min-h-screen w-full relative bg-black text-white overflow-hidden">
      {/* ✅ FIXED HEADER */}
      <header className="w-full h-[70px] flex items-center justify-between px-4 md:px-[50px] fixed top-0 z-[1000]">
        <div className="logo font-['Great_Vibes'] text-2xl md:text-[42px] font-normal text-white tracking-wide z-[1001] flex-shrink-0">
          Queens<span className="text-[#ff4d94]">Beauty</span>
        </div>

        <div className="header-right flex items-center gap-3 md:gap-5">
          {/* ✅ FIXED: Search with mobile toggle - Updated UX */}
          <div className="search-container relative z-[1001]">
            {/* Mobile Search Toggle Button - Now shows close icon when open */}
            <button
              className="search-toggle md:hidden bg-none border-none text-white text-xl cursor-pointer p-2 z-[1002] transition-all duration-300"
              onClick={() => {
                if (showSearchInput) {
                  // Close search: hide input, clear results, and reset state
                  setShowSearchInput(false);
                  setShowSearchResults(false);
                  setSearchQuery("");
                } else {
                  // Open search
                  setShowSearchInput(true);
                  // If there's already a query, show results immediately
                  if (searchQuery.trim() !== "") {
                    setShowSearchResults(true);
                  }
                }
              }}
            >
              {showSearchInput ? <FiX /> : <FiSearch />}
            </button>

            {/* Desktop Search - UNCHANGED */}
            <div className="hidden md:block relative">
              <FiSearch className="search-icon absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsAutoPlayActive(false)}
                className="search-box pl-10 pr-4 py-2 border-none rounded-[25px] w-[250px] text-sm bg-white/95 transition-all duration-300 shadow-sm focus:outline-none focus:bg-white focus:shadow-[0_0_0_2px_#ff4d94] text-gray-800"
              />
            </div>

            {/* ✅ Mobile Search Input Section (ONLY CHANGED) */}
            {showSearchInput && (
              <div className="md:hidden fixed top-[70px] left-0 right-0 z-[1003] px-4 pt-2 bg-transparent">
                <div className="relative w-full">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsAutoPlayActive(false)}
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-[25px] w-full text-sm bg-white text-gray-800 focus:outline-none shadow-md"
                    autoFocus
                  />
                </div>

                {/* ✅ Mobile Search Results */}
                {showSearchResults && searchQuery.trim() !== "" && (
                  <div className="search-results-mobile mt-2 bg-white rounded-xl shadow-2xl max-h-[300px] overflow-y-auto z-[1004] w-full border border-gray-200">
                    {searchResults.length === 0 ? (
                      <div className="no-results p-5 text-center text-gray-500 italic">
                        No products found
                      </div>
                    ) : (
                      <div className="p-2">
                        {searchResults.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => showExactProduct(product.id)}
                            className="search-result-item p-3 border-b border-gray-200 cursor-pointer transition-colors duration-300 flex items-center gap-3 hover:bg-gray-50"
                          >
                            <div
                              className="result-image w-10 h-10 rounded bg-cover bg-center flex-shrink-0"
                              style={{
                                backgroundImage: `url('${product.image}')`,
                              }}
                            />
                            <div className="result-info flex-1 min-w-0">
                              <div className="result-name font-semibold text-gray-800 mb-1 truncate">
                                {product.name}
                              </div>
                              <div className="result-price text-[#ff4d94] text-xs font-semibold">
                                KSH {product.price.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ✅ FIXED: Desktop Search Results */}
            {showSearchResults &&
              !showSearchInput &&
              searchQuery.trim() !== "" && (
                <div className="search-results-desktop absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl max-h-[300px] overflow-y-auto z-[1004] w-full md:w-auto min-w-[280px]">
                  {searchResults.length === 0 ? (
                    <div className="no-results p-5 text-center text-gray-500 italic">
                      No products found
                    </div>
                  ) : (
                    <div className="p-2">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => showExactProduct(product.id)}
                          className="search-result-item p-3 border-b border-gray-200 cursor-pointer transition-colors duration-300 flex items-center gap-3 hover:bg-gray-50"
                        >
                          <div
                            className="result-image w-10 h-10 rounded bg-cover bg-center flex-shrink-0"
                            style={{
                              backgroundImage: `url('${product.image}')`,
                            }}
                          />
                          <div className="result-info flex-1 min-w-0">
                            <div className="result-name font-semibold text-gray-800 mb-1 truncate">
                              {product.name}
                            </div>
                            <div className="result-price text-[#ff4d94] text-xs font-semibold">
                              KSH {product.price.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* ✅ FIXED: Cart Icon */}
          <div
            className="cart-icon relative cursor-pointer text-xl md:text-2xl text-white transition-all duration-300 z-[1001] hover:text-[#ff4d94] hover:scale-110"
            onClick={() => {
              console.log("Cart icon clicked");
              setShowCart(true);
            }}
          >
            <FiShoppingCart />
            {totalCartItems > 0 && (
              <span className="cart-count absolute -top-2 -right-2 bg-[#ff4d94] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm">
                {totalCartItems}
              </span>
            )}
          </div>
        </div>
      </header>
      {/* ✅ FIXED: Progress Bar - ALWAYS VISIBLE and properly animated */}
      {!isInSearchView && products.length > 0 && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-600 z-[9999]">
          <div
            className={`${styles.progressBar} ${
              !isAutoPlayActive ? styles.paused : ""
            }`}
            style={{
              width: isAutoPlayActive ? "100%" : "0%",
              transition: isAutoPlayActive ? "width 7s linear" : "none",
            }}
            key={currentSlideIndex}
          ></div>
        </div>
      )}
      {/* Close Search View Button */}
      {isInSearchView && (
        <button
          onClick={() => {
            setIsInSearchView(false);
            setIsAutoPlayActive(true);
            setDisplayedProducts(products);
          }}
          className="fixed top-20 right-5 z-[1004] bg-white/90 text-[#ff4d94] border-none w-10 h-10 rounded-full flex items-center justify-center text-xl cursor-pointer transition-all hover:bg-white hover:scale-110 shadow-lg"
        >
          <FiX />
        </button>
      )}
      {/* ✅ FIXED CAROUSEL */}
      <div
        className="carousel w-screen h-screen overflow-hidden relative"
        //onMouseEnter={() => setIsAutoPlayActive(false)}
        onMouseLeave={() => !isInSearchView && setIsAutoPlayActive(true)}
      >
        {/* Carousel List */}
        <div className="list w-full h-full">
          {displayedProducts.map((product, index) => {
            let positionClass = "";
            if (index === 0) positionClass = styles.carouselItemMain;
            else if (index === 1) positionClass = styles.carouselItemMain;
            else if (index === 2) positionClass = styles.carouselItemPreview1;
            else if (index === 3) positionClass = styles.carouselItemPreview2;
            else if (index === 4) positionClass = styles.carouselItemPreview3;
            else if (index === 5) positionClass = styles.carouselItemPreview4;
            else positionClass = styles.carouselItemHidden;

            const itemClass = `${styles.carouselItem} ${positionClass}`;
            const isActive = index === 1;

            return (
              <div
                key={product.id}
                className={itemClass}
                style={{
                  backgroundImage: `url('${product.image}')`,
                }}
              >
                {isActive && (
                  <div className="content absolute top-1/2 left-4 md:left-[100px] transform -translate-y-1/2 w-[90%] md:w-[400px] text-left text-white-100 z-[150]">
                    {/* ✅ Product Name */}
                    <div
                      className={`name text-4xl md:text-[60px] lg:text-[100px] uppercase font-bold leading-none [text-shadow:_2px_3px_3px_rgb(255_255_255_/_80%)] opacity-0 ${
                        isActive ? styles.fadeInDelay1 : ""
                      }`}
                    >
                      {product.name.toUpperCase()}
                    </div>

                    {/* ✅ Product Description */}
                    <div
                      className={`des mt-2 mb-5 text-sm md:text-lg ml-1 opacity-0 ${
                        isActive ? styles.fadeInDelay2 : ""
                      }`}
                    >
                      {product.description}
                    </div>

                    {/* ✅ Product Price */}
                    <div
                      className={`price text-2xl md:text-3xl font-semibold text-[#ff4d94] mb-4 opacity-0 ${
                        isActive ? styles.fadeInDelay2 : ""
                      }`}
                    >
                      KSH {product.price.toLocaleString()}
                    </div>

                    {/* ✅ Buttons */}
                    <div
                      className={`btn ml-1 opacity-0 ${
                        isActive ? styles.fadeInDelay3 : ""
                      }`}
                    >
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-[#ff4d94] text-white px-4 py-2 md:px-6 md:py-3 rounded-full font-semibold mr-2 md:mr-4 transition-all duration-300 hover:bg-[#e04484] hover:translate-y-[-3px] text-sm md:text-base"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => sendSingleProductWhatsApp(product)}
                        className="bg-transparent text-[#ff4d94] border-2 border-[#ff4d94] px-4 py-2 md:px-6 md:py-3 rounded-full font-semibold transition-all duration-300 hover:bg-[#ff4d94] hover:text-white text-sm md:text-base"
                      >
                        BUY NOW
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ✅ FIXED: Navigation Arrows */}
        <div className="arrows absolute top-[80%] right-[10%] md:right-[52%] z-[1000] w-[200px] md:w-[300px] max-w-[50%] flex gap-3 items-center">
          <button
            onClick={prevProduct}
            className="w-12 h-12 md:w-15 md:h-15 bg-[#ff4d94] text-white rounded-full border-none outline-none text-xl md:text-2xl font-mono font-bold transition-all duration-500 cursor-pointer hover:bg-white hover:text-[#ff4d94] hover:scale-110 flex items-center justify-center shadow-lg"
          >
            {"{"}
          </button>
          <button
            onClick={nextProduct}
            className="w-12 h-12 md:w-15 md:h-15 bg-[#ff4d94] text-white rounded-full border-none outline-none text-xl md:text-2xl font-mono font-bold transition-all duration-500 cursor-pointer hover:bg-white hover:text-[#ff4d94] hover:scale-110 flex items-center justify-center shadow-lg"
          >
            {"}"}
          </button>
        </div>
      </div>
      {/* ✅ FIXED: WhatsApp Button */}
      <button
        onClick={sendWhatsAppOrder}
        className="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-auto bg-[#25D366] hover:bg-[#1da851] text-white px-3 py-1 rounded-full font-semibold flex items-center justify-center gap-3 shadow-2xl z-[9999] transition-all duration-300 hover:scale-105 text-sm md:text-base"
      >
        <span className="text-xl">💬</span>
        Available on WhatsApp
      </button>
      {/* ✅ FIXED: Cart Overlay */}
      {showCart && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-end z-[9999]">
          <div className="cart-overlay bg-white text-gray-800 w-full md:w-[400px] h-full flex flex-col shadow-xl">
            <div className="cart-header p-5 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="cart-title text-xl font-semibold text-gray-800">
                  Shopping Cart ({totalCartItems})
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="close-cart text-2xl text-gray-600 cursor-pointer transition-colors duration-300 hover:text-[#ff4d94]"
                >
                  <FiX />
                </button>
              </div>
            </div>

            <div className="cart-items flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="empty-cart text-center text-gray-500 py-12">
                  <div className="text-5xl mb-4 text-gray-300">🛒</div>
                  <p>Your cart is empty</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="mt-4 bg-[#ff4d94] text-white px-6 py-2 rounded-full hover:bg-[#e04484]"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="cart-item flex mb-5 pb-5 border-b border-gray-200"
                  >
                    <div
                      className="cart-item-image w-20 h-20 rounded-lg mr-4 bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url('${item.image}')` }}
                    />
                    <div className="cart-item-details flex-1">
                      <div className="cart-item-name font-semibold mb-1 text-gray-800">
                        {item.name}
                      </div>
                      <div className="cart-item-price text-[#ff4d94] font-semibold mb-3">
                        KSH {item.price.toLocaleString()}
                      </div>
                      <div className="cart-item-actions flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="quantity-btn w-8 h-8 border border-gray-300 bg-white rounded cursor-pointer transition-colors duration-300 hover:bg-gray-50 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="quantity font-semibold mx-3 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="quantity-btn w-8 h-8 border border-gray-300 bg-white rounded cursor-pointer transition-colors duration-300 hover:bg-gray-50 flex items-center justify-center"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="remove-item text-[#ff4d94] cursor-pointer text-sm ml-auto transition-colors duration-300 hover:text-[#e04484] hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer p-5 border-t border-gray-200 bg-gray-50">
                <div className="cart-total flex justify-between items-center mb-5 text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-[#ff4d94]">
                    KSH{" "}
                    {cart
                      .reduce(
                        (total, item) => total + item.price * item.quantity,
                        0
                      )
                      .toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={sendWhatsAppOrder}
                  s
                  className="checkout-btn w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-3 transition-all duration-300 bg-[#25D366] hover:bg-[#1da851] text-white hover:translate-y-[-2px] shadow-lg"
                >
                  <span>💬</span>
                  Order Now on WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <CategoryGrid
        addToCart={addToCart}
        sendSingleProductWhatsApp={sendSingleProductWhatsApp}
      />
      <footer className="text-center text-gray-500 py-6 text-sm">
        © {new Date().getFullYear()} QueensBeauty by Hutheifa. All rights
        reserved.
        <br />
        <span>
          Discover luxury handbags, perfumes, and shoes at unbeatable prices —
          proudly made for Kenya’s modern woman.
        </span>
      </footer>
    </div>
  );
}
