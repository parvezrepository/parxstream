const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const {
  getEnabledProviders,
  getProvider,
  getProviderCatalog,
  getProviderPosts,
  searchProviderPosts,
  getProviderMeta,
  getProviderEpisodes,
  getProviderStream,
} = require('./providerManager');
const { handleProxyRequest } = require('./proxy');
const {
  initCinePro,
  getCineProMovieStreams,
  getCineProTVStreams,
  getCineProStatus,
  cineproPort
} = require('./cineproManager');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.url.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

const apiRouter = express.Router();

// Health check
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1. GET /providers -> Returns all enabled providers from manifest.json
apiRouter.get('/providers', (req, res) => {
  try {
    const providers = getEnabledProviders();
    res.json(providers);
  } catch (err) {
    console.error('Error fetching providers:', err.message);
    res.status(500).json({ error: 'Failed to load providers', message: err.message });
  }
});

// 2. GET /providers/:provider/catalog -> Returns { catalog, genres }
apiRouter.get('/providers/:provider/catalog', async (req, res) => {
  const { provider } = req.params;
  try {
    const result = await getProviderCatalog(provider);
    res.json(result);
  } catch (err) {
    console.error(`Error loading catalog for provider "${provider}":`, err.message);
    res.status(500).json({ error: 'Failed to load catalog', provider, message: err.message });
  }
});

// 3. GET /providers/:provider/posts?filter=...&page=1
apiRouter.get('/providers/:provider/posts', async (req, res) => {
  const { provider } = req.params;
  const filter = req.query.filter || '';
  const page = parseInt(req.query.page, 10) || 1;

  try {
    const posts = await getProviderPosts(provider, filter, page);
    res.json(posts);
  } catch (err) {
    console.error(`Error loading posts for provider "${provider}":`, err.message);
    res.status(500).json({ error: 'Failed to load posts', provider, message: err.message });
  }
});

// 4. GET /providers/:provider/search?q=...&page=1
apiRouter.get('/providers/:provider/search', async (req, res) => {
  const { provider } = req.params;
  const q = req.query.q || '';
  const page = parseInt(req.query.page, 10) || 1;

  if (!q.trim()) {
    return res.json([]);
  }

  try {
    const posts = await searchProviderPosts(provider, q, page);
    res.json(posts);
  } catch (err) {
    console.error(`Error searching posts for provider "${provider}":`, err.message);
    res.status(500).json({ error: 'Failed to search posts', provider, message: err.message });
  }
});

// 5. GET /providers/:provider/meta?link=...
apiRouter.get('/providers/:provider/meta', async (req, res) => {
  const { provider } = req.params;
  const link = req.query.link;

  if (!link) {
    return res.status(400).json({ error: 'Missing "link" query parameter' });
  }

  try {
    const meta = await getProviderMeta(provider, link);
    if (!meta) {
      return res.status(404).json({ error: 'Metadata not found', provider, link });
    }
    res.json(meta);
  } catch (err) {
    console.error(`Error loading meta for provider "${provider}":`, err.message);
    res.status(500).json({ error: 'Failed to load metadata', provider, message: err.message });
  }
});

// 6. GET /providers/:provider/episodes?url=...
apiRouter.get('/providers/:provider/episodes', async (req, res) => {
  const { provider } = req.params;
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'Missing "url" query parameter' });
  }

  try {
    const episodes = await getProviderEpisodes(provider, url);
    res.json(episodes);
  } catch (err) {
    console.error(`Error loading episodes for provider "${provider}":`, err.message);
    res.status(500).json({ error: 'Failed to load episodes', provider, message: err.message });
  }
});

// 7. GET /providers/:provider/stream?link=...&type=...
apiRouter.get('/providers/:provider/stream', async (req, res) => {
  const { provider } = req.params;
  const link = req.query.link;
  const type = req.query.type || 'movie';

  if (!link) {
    return res.status(400).json({ error: 'Missing "link" query parameter' });
  }

  try {
    const streams = await getProviderStream(provider, link, type);
    res.json(streams);
  } catch (err) {
    console.error(`Error resolving stream for provider "${provider}":`, err.message);
    res.status(500).json({ error: 'Failed to resolve stream', provider, message: err.message });
  }
});

// 8. CinePro Engine Routes
apiRouter.get('/cinepro/status', (req, res) => {
  res.json(getCineProStatus());
});

apiRouter.get('/cinepro/movie/:tmdbId', async (req, res) => {
  const { tmdbId } = req.params;
  try {
    const streams = await getCineProMovieStreams(tmdbId);
    res.json(streams);
  } catch (err) {
    console.error(`Error fetching CinePro movie ${tmdbId}:`, err.message);
    res.status(500).json({ error: 'Failed to fetch CinePro streams', message: err.message });
  }
});

apiRouter.get('/cinepro/tv/:tmdbId/:season/:episode', async (req, res) => {
  const { tmdbId, season, episode } = req.params;
  try {
    const streams = await getCineProTVStreams(tmdbId, season, episode);
    res.json(streams);
  } catch (err) {
    console.error(`Error fetching CinePro TV ${tmdbId} S${season}E${episode}:`, err.message);
    res.status(500).json({ error: 'Failed to fetch CinePro TV streams', message: err.message });
  }
});

const handleCineproProxy = async (req, res) => {
  const data = req.query.data;
  if (!data) {
    return res.status(400).json({ error: 'Missing data query parameter' });
  }
  try {
    const targetUrl = `http://127.0.0.1:${cineproPort}/v1/proxy?data=${encodeURIComponent(data)}`;
    const headers = { ...req.headers };
    delete headers.host;

    const proxyRes = await axios({
      method: req.method,
      url: targetUrl,
      headers,
      responseType: 'arraybuffer',
      validateStatus: () => true
    });

    const contentType = (proxyRes.headers['content-type'] || '').toLowerCase();
    const isM3u8 = contentType.includes('mpegurl') || contentType.includes('application/x-mpegurl') || contentType.includes('text/') || (typeof data === 'string' && data.includes('.m3u8'));

    Object.entries(proxyRes.headers).forEach(([k, v]) => {
      if (k.toLowerCase() !== 'content-length') {
        res.setHeader(k, v);
      }
    });
    res.status(proxyRes.status);

    if (isM3u8) {
      let text = Buffer.from(proxyRes.data).toString('utf8');
      // Rewrite any internal /v1/proxy?data= references to /api/cinepro/proxy?data=
      text = text.replace(/\/v1\/proxy\?data=/g, '/api/cinepro/proxy?data=');
      res.setHeader('content-type', 'application/vnd.apple.mpegurl; charset=utf-8');
      res.send(text);
    } else {
      res.setHeader('content-length', proxyRes.data.length);
      res.send(proxyRes.data);
    }
  } catch (err) {
    console.error('[CinePro Proxy Error]', err.message);
    res.status(500).json({ error: 'CinePro proxy failed', message: err.message });
  }
};

apiRouter.all('/cinepro/proxy', handleCineproProxy);
apiRouter.all('/v1/proxy', handleCineproProxy);
app.all('/v1/proxy', handleCineproProxy);

// 9. /proxy?url=...&headers=...
apiRouter.all('/proxy', handleProxyRequest);

// Mount on both /api prefix and root / for robust routing across services and rewrites
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Start server if executed directly
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`\n🎬 PARXSTREAM Provider Backend API running on http://localhost:${PORT}`);
    console.log(`   - Providers: http://localhost:${PORT}/api/providers`);
    console.log(`   - CinePro:   http://localhost:${PORT}/api/cinepro/status`);
    console.log(`   - Proxy:     http://localhost:${PORT}/api/proxy?url=...`);
    // Initialize CinePro Core engine in background
    initCinePro().catch(e => console.warn('[CinePro] Engine start error:', e.message));
  });
}

module.exports = app;

