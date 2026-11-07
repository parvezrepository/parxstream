const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Try loading curl-cffi-node for Chrome TLS impersonation (Cloudflare bypass)
let cffi = null;
try {
  cffi = require('curl-cffi-node');
} catch (e) {
  console.warn('[providerContext] curl-cffi-node not loaded, using axios default adapter:', e.message);
}

// Load local provider URLs
function resolveUrlsPath() {
  const candidates = [
    path.resolve(__dirname, 'vega-providers-main/urls.json'),
    path.resolve(__dirname, '../vega-providers-main/urls.json'),
    path.resolve(process.cwd(), 'vega-providers-main/urls.json'),
    path.resolve(process.cwd(), 'server/vega-providers-main/urls.json')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.resolve(__dirname, '../vega-providers-main/urls.json');
}

const urlsPath = resolveUrlsPath();
let localUrls = {};
try {
  if (fs.existsSync(urlsPath)) {
    localUrls = JSON.parse(fs.readFileSync(urlsPath, 'utf8'));
  }
} catch (e) {
  console.warn('[providerContext] Failed to read local urls.json:', e.message);
}

// In-memory KV store
const kvMemory = new Map();
const kvStore = {
  get: async (key) => (kvMemory.has(key) ? kvMemory.get(key) : null),
  set: async (key, val) => { kvMemory.set(key, val); },
  delete: async (key) => { kvMemory.delete(key); },
};

const commonHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

// Decompress helper for curl-cffi buffers
function decompressBuffer(rawBuffer, headers) {
  if (!rawBuffer || !Buffer.isBuffer(rawBuffer)) return rawBuffer;
  let contentEncoding = '';
  if (headers && typeof headers === 'object') {
    if (typeof headers.get === 'function') {
      contentEncoding = headers.get('content-encoding') || '';
    } else {
      contentEncoding = headers['content-encoding'] || headers['Content-Encoding'] || '';
    }
  }

  let decoded = rawBuffer;
  if (contentEncoding) {
    const enc = contentEncoding.toLowerCase();
    try {
      if (enc.includes('br')) {
        decoded = zlib.brotliDecompressSync(rawBuffer);
      } else if (enc.includes('gzip')) {
        decoded = zlib.gunzipSync(rawBuffer);
      } else if (enc.includes('deflate')) {
        decoded = zlib.inflateSync(rawBuffer);
      }
    } catch (e) {
      // Return raw buffer if decompression fails
    }
  }
  return decoded;
}

// Create custom Axios instance for providers
const providerAxios = axios.create({
  timeout: 25000,
  headers: { ...commonHeaders },
});

// Configure adapter with curl-cffi-node when available
if (cffi) {
  const originalAdapter = axios.defaults.adapter;
  providerAxios.defaults.adapter = async (config) => {
    const method = (config.method || 'get').toLowerCase();
    const cffiFunc = cffi[method] || cffi.get;
    
    let url = config.url || '';
    if (config.baseURL && !url.startsWith('http')) {
      url = config.baseURL.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '');
    }

    const reqHeaders = { ...commonHeaders };
    if (config.headers) {
      for (const [key, value] of Object.entries(config.headers)) {
        if (key.toLowerCase() === 'accept-encoding') continue;
        if (value !== undefined && value !== null) {
          reqHeaders[key] = String(value);
        }
      }
    }

    try {
      const res = await cffiFunc(url, {
        headers: reqHeaders,
        data: config.data,
        impersonate: 'chrome120',
        verify: false,
        timeout: (config.timeout || 25000) / 1000,
      });

      const rawBuffer = typeof res.buffer === 'function' ? res.buffer() : Buffer.from(res.data || '');
      const decodedBuffer = decompressBuffer(rawBuffer, res.headers);

      let contentType = '';
      if (res.headers && typeof res.headers === 'object') {
        if (typeof res.headers.get === 'function') {
          contentType = res.headers.get('content-type') || '';
        } else {
          contentType = res.headers['content-type'] || res.headers['Content-Type'] || '';
        }
      }

      let data;
      if (config.responseType === 'arraybuffer' || config.responseType === 'stream') {
        data = decodedBuffer;
      } else {
        data = decodedBuffer.toString('utf8');
        if (config.responseType === 'json' || contentType.includes('application/json')) {
          try { data = JSON.parse(data); } catch (e) {}
        }
      }

      return {
        data,
        status: res.status || 200,
        statusText: 'OK',
        headers: res.headers || {},
        config,
        request: {},
      };
    } catch (err) {
      // Fallback to standard axios adapter if curl-cffi fails
      if (typeof originalAdapter === 'function') {
        return originalAdapter(config);
      }
      throw err;
    }
  };
}

// Pre-fill global baseUrl cache for providers
globalThis.__vegaProviderBaseUrlCache__ = {
  data: localUrls,
  expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
};

// Intercept global fetch for URLs endpoint
const urlsEndpoint = 'https://raw.githubusercontent.com/Zenda-Cross/vega-providers/refs/heads/main/urls.json';
const nativeFetch = global.fetch;
global.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input?.url;
  if (url === urlsEndpoint) {
    return new Response(JSON.stringify(localUrls), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return nativeFetch ? nativeFetch(input, init) : Promise.reject(new Error('fetch unavailable'));
};

const getBaseUrl = async (providerValue) => {
  if (localUrls[providerValue]?.url) {
    return localUrls[providerValue].url;
  }
  // Try case variations
  const lower = providerValue.toLowerCase();
  for (const [k, v] of Object.entries(localUrls)) {
    if (k.toLowerCase() === lower && v.url) {
      return v.url;
    }
  }
  return '';
};

const providerContext = {
  axios: providerAxios,
  cheerio,
  commonHeaders,
  kvStore,
  getBaseUrl,
  Aes: null,
};

module.exports = {
  providerContext,
  localUrls,
  getBaseUrl,
  commonHeaders,
};

