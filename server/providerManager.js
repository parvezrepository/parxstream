const fs = require('fs');
const path = require('path');
const { providerContext } = require('./providerContext');

function resolveVegaDir() {
  const candidates = [
    process.env.VEGA_DIR,
    path.resolve(__dirname, 'vega-providers-main'),
    path.resolve(__dirname, '..', 'vega-providers-main'),
    path.resolve(process.cwd(), 'vega-providers-main'),
    path.resolve(process.cwd(), 'server', 'vega-providers-main')
  ];
  for (const c of candidates) {
    if (c && fs.existsSync(path.resolve(c, 'manifest.json'))) {
      return c;
    }
  }
  return path.resolve(__dirname, '..', 'vega-providers-main');
}

const vegaDir = resolveVegaDir();
const manifestPath = path.resolve(vegaDir, 'manifest.json');
const distDir = path.resolve(vegaDir, 'dist');

let manifestCache = null;

function loadManifest() {
  if (manifestCache) return manifestCache;
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found at ${manifestPath}`);
  }
  const raw = fs.readFileSync(manifestPath, 'utf8');
  manifestCache = JSON.parse(raw);
  return manifestCache;
}

function getEnabledProviders() {
  const all = loadManifest();
  return all.filter((p) => !p.disabled);
}

function getProvider(providerValue) {
  const all = loadManifest();
  const found = all.find((p) => p.value.toLowerCase() === providerValue.toLowerCase());
  return found || null;
}

function loadProviderModule(providerValue, moduleName) {
  // Support matching folder by exact name or case-insensitive
  let providerFolder = providerValue;
  const exactPath = path.resolve(distDir, providerFolder);
  if (!fs.existsSync(exactPath)) {
    if (fs.existsSync(distDir)) {
      const dirs = fs.readdirSync(distDir);
      const matched = dirs.find((d) => d.toLowerCase() === providerValue.toLowerCase());
      if (matched) {
        providerFolder = matched;
      } else {
        throw new Error(`Provider folder "${providerValue}" not found in dist/`);
      }
    } else {
      throw new Error(`Dist directory not found at ${distDir}`);
    }
  }

  const modulePath = path.resolve(distDir, providerFolder, `${moduleName}.js`);
  if (!fs.existsSync(modulePath)) {
    return null;
  }

  return require(modulePath);
}

async function getProviderCatalog(providerValue) {
  const mod = loadProviderModule(providerValue, 'catalog');
  if (!mod) {
    throw new Error(`Catalog module not found for provider "${providerValue}"`);
  }

  let catalog = mod.catalog;
  if (typeof catalog === 'function') {
    catalog = await catalog({ providerContext, providerValue });
  } else if (catalog && typeof catalog.then === 'function') {
    catalog = await catalog;
  }

  let genres = mod.genres || [];
  if (typeof genres === 'function') {
    genres = await genres({ providerContext, providerValue });
  } else if (genres && typeof genres.then === 'function') {
    genres = await genres;
  }

  return {
    catalog: Array.isArray(catalog) ? catalog : [],
    genres: Array.isArray(genres) ? genres : [],
  };
}

async function getProviderPosts(providerValue, filter, page = 1) {
  const mod = loadProviderModule(providerValue, 'posts');
  if (!mod || typeof mod.getPosts !== 'function') {
    throw new Error(`getPosts function not found for provider "${providerValue}"`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const posts = await mod.getPosts({
      filter: filter || '',
      page: Number(page) || 1,
      providerValue,
      signal: controller.signal,
      providerContext,
    });
    return Array.isArray(posts) ? posts : [];
  } finally {
    clearTimeout(timeoutId);
  }
}

async function searchProviderPosts(providerValue, searchQuery, page = 1) {
  const mod = loadProviderModule(providerValue, 'posts');
  if (!mod || typeof mod.getSearchPosts !== 'function') {
    throw new Error(`getSearchPosts function not found for provider "${providerValue}"`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const posts = await mod.getSearchPosts({
      searchQuery: searchQuery || '',
      page: Number(page) || 1,
      providerValue,
      signal: controller.signal,
      providerContext,
    });
    return Array.isArray(posts) ? posts : [];
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getProviderMeta(providerValue, link) {
  const mod = loadProviderModule(providerValue, 'meta');
  if (!mod || typeof mod.getMeta !== 'function') {
    throw new Error(`getMeta function not found for provider "${providerValue}"`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const meta = await mod.getMeta({
      link,
      providerContext,
      signal: controller.signal,
    });
    return meta || null;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getProviderEpisodes(providerValue, url) {
  const mod = loadProviderModule(providerValue, 'episodes');
  if (!mod || typeof mod.getEpisodes !== 'function') {
    throw new Error(`getEpisodes function not found for provider "${providerValue}"`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const episodes = await mod.getEpisodes({
      url,
      providerContext,
      signal: controller.signal,
    });
    return Array.isArray(episodes) ? episodes : [];
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getProviderStream(providerValue, link, type = 'movie') {
  const mod = loadProviderModule(providerValue, 'stream');
  if (!mod || typeof mod.getStream !== 'function') {
    throw new Error(`getStream function not found for provider "${providerValue}"`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const streams = await mod.getStream({
      link,
      type: type || 'movie',
      signal: controller.signal,
      providerContext,
    });
    return Array.isArray(streams) ? streams : [];
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  getEnabledProviders,
  getProvider,
  getProviderCatalog,
  getProviderPosts,
  searchProviderPosts,
  getProviderMeta,
  getProviderEpisodes,
  getProviderStream,
};

