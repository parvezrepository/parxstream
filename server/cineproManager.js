/**
 * CinePro Core Manager
 * Bridges OMSS-compliant CinePro multi-provider scraping engine (17+ providers)
 * with the Express backend and web frontend.
 */

const path = require('path');
const axios = require('axios');

let cineproServerInstance = null;
let cineproPort = process.env.CINEPRO_PORT ? parseInt(process.env.CINEPRO_PORT, 10) : 5002;
let isInitialized = false;
let initPromise = null;
let registeredProvidersList = [];

/**
 * Initialize CinePro Core OMSS Engine
 */
async function initCinePro() {
  if (isInitialized) return true;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      console.log('[CinePro] Initializing CinePro Core OMSS Engine...');
      const { OMSSServer } = await import('@omss/framework');
      const { knownThirdPartyProxies } = await import('./cinepro-core/dist/thirdPartyProxies.js');
      const { streamPatterns } = await import('./cinepro-core/dist/streamPatterns.js');

      const tmdbKey = process.env.TMDB_API_KEY || '3c7e2985716f8f6a43a41e0dfff8bb96';

      cineproServerInstance = new OMSSServer({
        name: 'CinePro Core',
        version: '1.0.0',
        host: '127.0.0.1',
        port: cineproPort,
        cache: {
          type: 'memory',
          ttl: { sources: 3600, subtitles: 86400 }
        },
        tmdb: {
          apiKey: tmdbKey,
          cacheTTL: 86400
        },
        proxyConfig: {
          knownThirdPartyProxies,
          streamPatterns
        },
        cors: { origin: '*' }
      });

      const registry = cineproServerInstance.getRegistry();
      const providersDir = path.join(__dirname, 'cinepro-core/dist/providers');
      await registry.discoverProviders(providersDir);

      // Disable unresponsive or dead providers to ensure ultra-fast 2s stream resolution
      registry.getProviders().forEach(p => {
        if (p.id.toLowerCase() === 'videasy') {
          p.enabled = false;
        }
      });

      registeredProvidersList = registry.getProviders().map(p => ({
        id: p.id,
        name: p.name,
        enabled: p.enabled !== false
      }));

      await cineproServerInstance.start();
      isInitialized = true;
      console.log(`[CinePro] Engine online on 127.0.0.1:${cineproPort} with ${registeredProvidersList.length} active providers`);
      return true;
    } catch (err) {
      console.error('[CinePro] Failed to initialize CinePro Core:', err.message);
      isInitialized = false;
      return false;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

/**
 * Format and rewrite CinePro sources so proxy endpoints route through Express /api/cinepro/proxy
 */
function normalizeCineproSources(rawSources) {
  if (!Array.isArray(rawSources)) return [];

  return rawSources.map((s, idx) => {
    let playLink = s.url || '';

    // Rewrite internal http://127.0.0.1:5002/v1/proxy?data=... to public /api/cinepro/proxy?data=...
    if (playLink.includes('/v1/proxy?data=')) {
      const dataParam = playLink.split('/v1/proxy?data=')[1];
      playLink = `/api/cinepro/proxy?data=${dataParam}`;
    }

    const providerName = s.provider?.name || s.provider?.id || 'CinePro';
    const qualityLabel = s.quality || 'Auto HD';

    return {
      server: `${providerName} (${qualityLabel})`,
      link: playLink,
      originalUrl: s.url,
      type: (s.type === 'hls' || (s.url && s.url.includes('.m3u8'))) ? 'm3u8' : (s.type || 'm3u8'),
      quality: qualityLabel,
      subtitles: Array.isArray(s.subtitles) ? s.subtitles : [],
      audioTracks: Array.isArray(s.audioTracks) ? s.audioTracks : [],
      provider: providerName,
      isCinePro: true
    };
  });
}

/**
 * Fetch movie streaming sources for TMDB ID
 */
async function getCineProMovieStreams(tmdbId) {
  await initCinePro();
  if (!isInitialized) return [];

  try {
    const res = await axios.get(`http://127.0.0.1:${cineproPort}/v1/movies/${encodeURIComponent(tmdbId)}`, {
      timeout: 35000
    });
    return normalizeCineproSources(res.data?.sources || []);
  } catch (err) {
    console.warn(`[CinePro] Movie fetch error for TMDB ${tmdbId}:`, err.message);
    return [];
  }
}

/**
 * Fetch TV episode streaming sources for TMDB ID, Season, Episode
 */
async function getCineProTVStreams(tmdbId, season = 1, episode = 1) {
  await initCinePro();
  if (!isInitialized) return [];

  try {
    const s = parseInt(season, 10) || 1;
    const ep = parseInt(episode, 10) || 1;
    const res = await axios.get(`http://127.0.0.1:${cineproPort}/v1/tv/${encodeURIComponent(tmdbId)}/seasons/${s}/episodes/${ep}`, {
      timeout: 35000
    });
    return normalizeCineproSources(res.data?.sources || []);
  } catch (err) {
    console.warn(`[CinePro] TV fetch error for TMDB ${tmdbId} S${season}E${episode}:`, err.message);
    return [];
  }
}

/**
 * Get CinePro internal proxy target URL
 */
function getInternalProxyBase() {
  return `http://127.0.0.1:${cineproPort}/v1/proxy`;
}

/**
 * Get active provider count and details
 */
function getCineProStatus() {
  return {
    initialized: isInitialized,
    port: cineproPort,
    providerCount: registeredProvidersList.length,
    providers: registeredProvidersList
  };
}

module.exports = {
  initCinePro,
  getCineProMovieStreams,
  getCineProTVStreams,
  getCineProStatus,
  getInternalProxyBase,
  cineproPort
};
