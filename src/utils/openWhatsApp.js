// src/utils/openWhatsApp.js

export const openWhatsApp = (message, phone = "254714137554") => {
  const encoded = encodeURIComponent(message);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    // Mobile → try WhatsApp app first
    const appLink = `whatsapp://send?phone=${phone}&text=${encoded}`;
    const webFallback = `https://wa.me/${phone}?text=${encoded}`;

    // Try to open WhatsApp app
    window.location.href = appLink;

    // Fallback after 1.5s if app doesn’t open
    setTimeout(() => {
      window.location.href = webFallback;
    }, 1500);
  } else {
    // Desktop → open WhatsApp Web
    window.open(
      `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`,
      "_blank",
      "width=800,height=600"
    );
  }
};
