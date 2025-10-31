import React from "react";

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();

    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const message = e.target.message.value.trim();

    if (!name || !email || !message) {
      alert("Please fill out all fields before sending.");
      return;
    }

    const phoneNumber = "254736984633";
    const text = `*New message from QueensBeauty Contact Form*\n\n👤 Name: ${name}\n📧 Email: ${email}\n💬 Message: ${message}`;
    const encodedText = encodeURIComponent(text);

    const whatsappAppURL = `whatsapp://send?phone=${phoneNumber}&text=${encodedText}`;
    const whatsappWebURL = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = whatsappAppURL;
      setTimeout(() => {
        window.location.href = whatsappWebURL;
      }, 1500);
    } else {
      window.open(whatsappWebURL, "_blank");
    }

    e.target.reset();
  };

  return (
    <section
      className="py-16 bg-gradient-to-b from-pink-50 to-white text-gray-800"
      id="contact"
    >
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <h2 className="text-4xl font-extrabold text-center text-pink-700 mb-8">
          Contact Us
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16">
          <div className="text-center md:text-left space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900">
              We'd love to hear from you 💖
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Have a question, feedback, or a custom order request? Send us a
              message, and we’ll get back to you as soon as possible.
            </p>
            <p className="text-pink-700 font-semibold">📞 +254 736984633</p>
            <p className="text-gray-700">
              📍 Duka La Vioo & Hardware, Nairobi, Kenya
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-gray-50 rounded-2xl shadow-lg p-8 flex flex-col space-y-4"
          >
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            />
            <textarea
              name="message"
              rows="5"
              placeholder="Your Message"
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            ></textarea>
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold transition-all duration-300"
            >
              Send Message via WhatsApp
            </button>
          </form>
        </div>

        {/* 🗺️ Map Embed */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
          <iframe
            title="Duka La Vioo & Hardware Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1595.991172869827!2d36.072925!3d-0.2839866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18298d94003ed775%3A0xed94a4fdaa3270f0!2sDuka+La+Vioo+%26+Hardware!5e0!3m2!1sen!2ske!4v1698280000000!5m2!1sen!2ske"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
