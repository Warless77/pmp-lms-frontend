const fs = require("fs");
const path = require("path");

const publicIndex = path.join(__dirname, "..", "public", "index.html");
const distDir = path.join(__dirname, "..", "dist");
const distIndex = path.join(distDir, "index.html");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.copyFileSync(publicIndex, distIndex);
console.log("Copied public/index.html to dist/index.html");
