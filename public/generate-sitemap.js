// generate-sitemap.js
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "https://qzigaimmzdtubahwcjyr.supabase.co",
  process.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6aWdhaW1temR0dWJhaHdjanlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTIyOTAsImV4cCI6MjA3NTQ2ODI5MH0.cvxQVQKDi4J-QJw6FX3Zyvkn9fIIo2p6MLZaK1OTDVo"
);

const baseUrl = "https://queensbeauty.netlify.app";

async function generateSitemap() {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name");

    if (error) throw error;

    const urls = [
      "",
      "/about",
      "/contact",
      "/shop",
      ...products.map(
        (p) =>
          `/product/${encodeURIComponent(
            p.name.toLowerCase().replace(/\s+/g, "-")
          )}`
      ),
    ];

    const xmlUrls = urls
      .map(
        (url) => `
  <url>
    <loc>${baseUrl}${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${url === "" ? "1.0" : "0.8"}</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${xmlUrls}
</urlset>`;

    fs.writeFileSync("./dist/sitemap.xml", xml, "utf8");
    console.log("✅ Sitemap generated successfully!");
  } catch (err) {
    console.error("❌ Error generating sitemap:", err.message);
  }
}

generateSitemap();
