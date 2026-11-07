const express = require('express');
const cors = require('cors');
const path = require('path');
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

// 8. /proxy?url=...&headers=...
apiRouter.all('/proxy', handleProxyRequest);

// Mount on both /api prefix and root / for robust routing across services and rewrites
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Start server if executed directly
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🎬 CineStream Provider Backend API running on http://localhost:${PORT}`);
    console.log(`   - Providers: http://localhost:${PORT}/api/providers`);
    console.log(`   - Proxy:     http://localhost:${PORT}/api/proxy?url=...`);
  });
}

module.exports = app;

