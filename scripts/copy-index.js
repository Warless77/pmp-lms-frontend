const fs = require("fs");
const path = require("path");

const publicIndex = path.join(__dirname, "..", "public", "index.html");
const distIndex = path.join(__dirname, "..", "dist", "index.html");
const distDir = path.join(__dirname, "..", "dist");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.copyFileSync(publicIndex, distIndex);
console.log("Copied public/index.html to dist/index.html");