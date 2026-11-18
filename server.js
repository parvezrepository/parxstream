// PARXSTREAM - cPanel / LiteSpeed / Passenger Production Server
process.env.NODE_ENV = "production";
const http = require("http");
const path = require("path");
const fs = require("fs");

// 1. Auto-load .env and .env.production into process.env
for (const envFile of [".env", ".env.production"]) {
  const envPath = path.resolve(__dirname, envFile);
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, "utf8");
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          if (process.env[key] === undefined || process.env[key] === "") {
            process.env[key] = val;
          }
        }
      });
    } catch (e) {
      console.warn("[PARXSTREAM] Warning reading env file:", envFile, e.message);
    }
  }
}

// 2. MIME map for ultra-fast static file delivery
const MIME_TYPES = {
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".mjs": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".txt": "text/plain; charset=UTF-8",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".apk": "application/vnd.android.package-archive",
};

// 3. Static Asset Interceptor: intercepts http.createServer to guarantee 100% CSS/JS/Image delivery
const origCreateServer = http.createServer;
http.createServer = function (opts, requestListener) {
  const handler = typeof opts === "function" ? opts : requestListener;

  const wrappedListener = (req, res) => {
    try {
      const host = req.headers.host || "localhost";
      const parsedUrl = new URL(req.url, `http://${host}`);
      let pathname = parsedUrl.pathname;

      // Handle /_next/static/*
      if (pathname.startsWith("/_next/static/")) {
        const relPath = pathname.replace("/_next/static/", "");
        const candidates = [
          path.join(__dirname, ".next", "static", relPath),
          path.join(__dirname, "app_bundle", ".next", "static", relPath),
        ];

        for (const filePath of candidates) {
          if (fs.existsSync(filePath)) {
            try {
              const stat = fs.statSync(filePath);
              if (stat.isFile()) {
                const ext = path.extname(filePath).toLowerCase();
                const contentType = MIME_TYPES[ext] || "application/octet-stream";
                res.writeHead(200, {
                  "Content-Type": contentType,
                  "Content-Length": stat.size,
                  "Cache-Control": "public, max-age=31536000, immutable",
                  "Access-Control-Allow-Origin": "*",
                });
                fs.createReadStream(filePath).pipe(res);
                return;
              }
            } catch (err) {
              // fall through if read error
            }
          }
        }
      }

      // Handle root public assets (e.g. /logo.png, /favicon.ico, /apk/parxstream.apk)
      if (pathname.length > 1 && !pathname.startsWith("/api/") && !pathname.startsWith("/_next/")) {
        const cleanPath = pathname.slice(1);
        const publicCandidates = [
          path.join(__dirname, "public", cleanPath),
          path.join(__dirname, "app_bundle", "public", cleanPath),
        ];

        for (const pubPath of publicCandidates) {
          if (fs.existsSync(pubPath)) {
            try {
              const stat = fs.statSync(pubPath);
              if (stat.isFile()) {
                const ext = path.extname(pubPath).toLowerCase();
                const contentType = MIME_TYPES[ext] || "application/octet-stream";
                res.writeHead(200, {
                  "Content-Type": contentType,
                  "Content-Length": stat.size,
                  "Cache-Control": "public, max-age=86400",
                  "Access-Control-Allow-Origin": "*",
                });
                fs.createReadStream(pubPath).pipe(res);
                return;
              }
            } catch (err) {
              // fall through
            }
          }
        }
      }
    } catch (e) {
      console.warn("[PARXSTREAM] Static interceptor error:", e.message);
    }

    // Pass everything else to Next.js handler
    return handler(req, res);
  };

  if (typeof opts === "function") {
    return origCreateServer.call(this, wrappedListener);
  } else {
    return origCreateServer.call(this, opts, wrappedListener);
  }
};

// 4. Launch Next.js standalone server
require("./app_bundle/server.js");
