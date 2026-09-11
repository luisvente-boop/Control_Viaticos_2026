// Servidor local portable — sin dependencias externas, solo Node.js.
// Uso: node server.js
// Luego abre la URL que se muestra en el celular (misma red WiFi que la PC).

const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = 8080;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function getLocalIPs() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) ips.push(net.address);
    }
  }
  return ips;
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 - Archivo no encontrado: " + urlPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("\n===================================================");
  console.log("  Servidor de Control de Viáticos MVCS iniciado");
  console.log("===================================================");
  console.log("  En esta PC:   http://localhost:" + PORT);
  const ips = getLocalIPs();
  if (ips.length) {
    console.log("  Desde el celular (misma WiFi):");
    ips.forEach((ip) => console.log("                 http://" + ip + ":" + PORT));
  } else {
    console.log("  No se detectó una IP de red local. Conecta la PC a WiFi/LAN.");
  }
  console.log("===================================================");
  console.log("  Presiona Ctrl+C para detener el servidor.\n");
});
