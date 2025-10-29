// generate-sitemap.js
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// 🔐 Read environment variables (Netlify-compatible)
const SUPABASE_URL = (process.env.VITE_SUPABASE_URL =
  "https://qzigaimmzdtubahwcjyr.supabase.co");
const SUPABASE_ANON_KEY = (process.env.VITE_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6aWdhaW1temR0dWJhaHdjanlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTIyOTAsImV4cCI6MjA3NTQ2ODI5MH0.cvxQVQKDi4J-QJw6FX3Zyvkn9fIIo2p6MLZaK1OTDVo");
const BASE_URL = "https://queensbeauty.netlify.app"; // your live site URL

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function generateSitemap() {
  console.log("🗺️ Generating dynamic sitemap from Supabase...");

  // Fetch products from Supabase
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name");

  if (error) {
    console.error("❌ Supabase fetch error:", error.message);
    process.exit(1);
  }

  // Base static pages
  const urls = [
    { loc: `${BASE_URL}/`, priority: 1.0 },
    { loc: `${BASE_URL}/admin`, priority: 0.3 },
  ];

  // Add product pages dynamically
  if (products && products.length > 0) {
    products.forEach((p) => {
      const slug = p.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      urls.push({
        loc: `${BASE_URL}/product/${slug}`,
        priority: 0.8,
      });
    });
  }

  // Build XML
  const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls
      .map(
        (u) => `
      <url>
        <loc>${u.loc}</loc>
        <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
        <priority>${u.priority}</priority>
      </url>`
      )
      .join("")}
  </urlset>`;

  // Save file in /dist (Netlify deploys that)
  const outputDir = path.resolve("dist");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  fs.writeFileSync(path.join(outputDir, "sitemap.xml"), sitemapXML);

  console.log(`✅ Sitemap generated with ${urls.length} pages.`);
}

generateSitemap();
