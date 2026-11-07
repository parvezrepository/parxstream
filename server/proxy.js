const axios = require('axios');
const { URL } = require('url');

let cffi = null;
try {
  cffi = require('curl-cffi-node');
} catch (e) {
  // cffi optional
}

function parseHeadersParam(param) {
  if (!param) return {};
  if (typeof param === 'object') return param;
  try {
    return JSON.parse(param);
  } catch (e) {
    try {
      const decoded = Buffer.from(param, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (e2) {
      return {};
    }
  }
}

function isM3U8(url, contentType, textSample = '') {
  if (typeof contentType === 'string') {
    const lower = contentType.toLowerCase();
    if (
      lower.includes('application/vnd.apple.mpegurl') ||
      lower.includes('application/x-mpegurl') ||
      lower.includes('audio/mpegurl') ||
      lower.includes('video/mp2t') === false && lower.includes('mpegurl')
    ) {
      return true;
    }
  }
  const cleanUrl = url.split('?')[0].toLowerCase();
  if (cleanUrl.endsWith('.m3u8')) return true;
  if (textSample.trim().startsWith('#EXTM3U')) return true;
  return false;
}

function rewriteM3U8(content, baseUrl, customHeaders) {
  const lines = content.split(/\r?\n/);
  const headersQuery = encodeURIComponent(JSON.stringify(customHeaders || {}));

  const rewritten = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return line;

    // Handle URI inside #EXT-X-KEY, #EXT-X-MEDIA, etc.
    if (trimmed.startsWith('#EXT-X-KEY') || trimmed.startsWith('#EXT-X-MEDIA')) {
      return line.replace(/URI="([^"]+)"/g, (match, uri) => {
        try {
          const resolved = new URL(uri, baseUrl).href;
          const proxied = `/api/proxy?url=${encodeURIComponent(resolved)}&headers=${headersQuery}`;
          return `URI="${proxied}"`;
        } catch (e) {
          return match;
        }
      });
    }

    // Tag line
    if (trimmed.startsWith('#')) {
      return line;
    }

    // Segment or sub-playlist URI line
    try {
      const resolved = new URL(trimmed, baseUrl).href;
      return `/api/proxy?url=${encodeURIComponent(resolved)}&headers=${headersQuery}`;
    } catch (e) {
      return line;
    }
  });

  return rewritten.join('\n');
}

async function handleProxyRequest(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing "url" query parameter' });
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    return res.sendStatus(204);
  }

  const customHeaders = parseHeadersParam(req.query.headers);

  // Prepare outbound headers
  const outgoingHeaders = {
    'User-Agent':
      customHeaders['User-Agent'] ||
      customHeaders['user-agent'] ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: '*/*',
  };

  if (customHeaders.Referer || customHeaders.referer) {
    outgoingHeaders['Referer'] = customHeaders.Referer || customHeaders.referer;
  }
  if (customHeaders.Origin || customHeaders.origin) {
    outgoingHeaders['Origin'] = customHeaders.Origin || customHeaders.origin;
  }
  for (const [k, v] of Object.entries(customHeaders)) {
    if (!['user-agent', 'referer', 'origin'].includes(k.toLowerCase())) {
      outgoingHeaders[k] = v;
    }
  }

  // Forward Range header if present
  if (req.headers.range) {
    outgoingHeaders['Range'] = req.headers.range;
  }

  // Check if likely M3U8
  const cleanUrl = targetUrl.split('?')[0].toLowerCase();
  const likelyM3U8 = cleanUrl.endsWith('.m3u8');

  try {
    if (likelyM3U8) {
      // Fetch as text to rewrite
      const response = await axios.get(targetUrl, {
        headers: outgoingHeaders,
        responseType: 'text',
        timeout: 20000,
        validateStatus: () => true,
      });

      const contentType = response.headers['content-type'] || 'application/vnd.apple.mpegurl';

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Expose-Headers', '*');
      res.setHeader('Content-Type', contentType.includes('mpegurl') ? contentType : 'application/vnd.apple.mpegurl');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

      if (response.status >= 400) {
        return res.status(response.status).send(response.data);
      }

      const rewritten = rewriteM3U8(response.data, targetUrl, customHeaders);
      return res.status(200).send(rewritten);
    }

    // Binary stream (segments .ts, .mp4, subtitles .vtt, etc.)
    const response = await axios({
      method: 'get',
      url: targetUrl,
      headers: outgoingHeaders,
      responseType: 'stream',
      timeout: 30000,
      validateStatus: () => true,
    });

    const contentType = response.headers['content-type'] || 'video/mp4';

    // If target actually turned out to be an M3U8 manifest despite missing .m3u8 extension
    if (isM3U8(targetUrl, contentType)) {
      const chunks = [];
      response.data.on('data', (chunk) => chunks.push(chunk));
      response.data.on('end', () => {
        const fullText = Buffer.concat(chunks).toString('utf8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Cache-Control', 'no-cache');
        const rewritten = rewriteM3U8(fullText, targetUrl, customHeaders);
        res.status(response.status).send(rewritten);
      });
      return;
    }

    // Set CORS and streaming headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');

    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }
    if (response.headers['content-range']) {
      res.setHeader('Content-Range', response.headers['content-range']);
    }
    if (response.headers['accept-ranges']) {
      res.setHeader('Accept-Ranges', response.headers['accept-ranges']);
    }

    res.status(response.status);
    response.data.pipe(res);

    response.data.on('error', (streamErr) => {
      console.error('[proxy stream error]', streamErr.message);
      if (!res.headersSent) {
        res.status(502).json({ error: 'Stream error', message: streamErr.message });
      }
    });
  } catch (err) {
    console.error(`[proxy error] ${targetUrl}:`, err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Proxy fetch failed', message: err.message });
    }
  }
}

module.exports = {
  handleProxyRequest,
  rewriteM3U8,
};

