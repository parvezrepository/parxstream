/**
 * PARXSTREAM - MovieBox VIP Core Integration Engine
 * 
 * High-speed 1080p stream extraction, multi-audio (Dual Audio / Hindi Dubs),
 * authenticated CDN stream delivery, and clean season/episode filtering.
 * Based on the Moviebox-API architecture with Native + Web failover.
 */

const crypto = require('crypto');
const axios = require('axios');

// Signature & API Constants
const SECRET_KEY_DEFAULT_B64 = 'NzZpUmwwN3MweFNOOWpxbUVXQXQ3OUVCSlp1bElRSXNWNjRGWnIyTw==';
const MODERN_USER_AGENT = 'com.community.mbox.in/50020130 (Linux; U; Android 14; en_IN; Pixel 8; Build/UD1A.230803.041; Cronet/145.0.7582.0)';
const WEB_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const NATIVE_API_BASE = 'https://api3.aoneroom.com';
const BOOTSTRAP_HOST = 'https://apig.inmoviebox.com';
const BOOTSTRAP_URL = `${BOOTSTRAP_HOST}/wefeed-mobile-bff/tab/ranking-list?tabId=0&categoryType=4516404531735022304&page=1&perPage=1`;

const WEB_DOMAINS = [
  'https://123moviesfree.club',
  'https://movie-box.co',
  'https://movieboxonline.net',
  'https://sflix.film',
  'https://movieboxhd.net'
];

// In-Memory Token & Search Cache
let cachedBearerToken = null;
let tokenExpiresAt = 0;
const deviceId = crypto.randomBytes(16).toString('hex');
const searchCache = new Map();

// Helper Cryptographic Functions
function b64decode(s) {
  let clean = s.replace(/-/g, '+').replace(/_/g, '/');
  clean += '='.repeat((4 - (clean.length % 4)) % 4);
  return Buffer.from(clean, 'base64');
}

function getSecretBytes() {
  const inner = b64decode(SECRET_KEY_DEFAULT_B64).toString('utf-8');
  return b64decode(inner);
}

function md5Hex(data) {
  return crypto.createHash('md5').update(data).digest('hex');
}

function generateXClientToken(ts) {
  const tsStr = String(ts);
  const reversed = Buffer.from(tsStr.split('').reverse().join(''), 'utf-8');
  return `${tsStr},${md5Hex(reversed)}`;
}

function generateClientInfo(devId) {
  return JSON.stringify({
    package_name: 'com.community.mbox.in',
    version_name: '4.0.03.0920.03',
    version_code: 50020130,
    os: 'android',
    os_version: '14',
    device_id: devId,
    install_store: 'official',
    gaid: '1b2212c1-dadf-43c3-a0c8-bd6ce48ae22d',
    brand: 'Google',
    model: 'Pixel 8',
    system_language: 'en',
    net: 'NETWORK_WIFI',
    region: 'IN',
    timezone: 'Asia/Calcutta',
    sp_code: ''
  });
}

function buildCanonicalString(method, accept, contentType, url, body, ts) {
  const u = new URL(url);
  let canonicalQuery = '';
  if (u.search) {
    const pairs = [];
    u.searchParams.forEach((v, k) => pairs.push([k, v]));
    pairs.sort((a, b) => a[0].localeCompare(b[0]));
    canonicalQuery = '?' + pairs.map(p => `${p[0]}=${p[1]}`).join('&');
  }
  const canonicalUrl = u.pathname + canonicalQuery;
  const bodyBytes = body ? Buffer.from(body, 'utf-8') : null;
  const bodyLen = bodyBytes ? String(bodyBytes.length) : '';
  const bodyHash = bodyBytes ? md5Hex(bodyBytes.slice(0, 102400)) : '';

  return [
    method.toUpperCase(),
    accept || '',
    contentType || '',
    bodyLen,
    String(ts),
    bodyHash,
    canonicalUrl
  ].join('\n');
}

function generateSignature(method, accept, contentType, url, body, ts) {
  const canonical = buildCanonicalString(method, accept, contentType, url, body, ts);
  const key = getSecretBytes();
  const digest = crypto.createHmac('md5', key).update(Buffer.from(canonical, 'utf-8')).digest('base64');
  return `${ts}|2|${digest}`;
}

/**
 * Bootstrap authentication token with auto-refresh
 */
async function getAuthToken(force = false) {
  if (cachedBearerToken && Date.now() < tokenExpiresAt && !force) {
    return cachedBearerToken;
  }

  const ts = Date.now();
  const headers = {
    'user-agent': MODERN_USER_AGENT,
    'accept': 'application/json',
    'content-type': 'application/json',
    'connection': 'keep-alive',
    'x-client-token': generateXClientToken(ts),
    'x-tr-signature': generateSignature('GET', 'application/json', 'application/json', BOOTSTRAP_URL, null, ts),
    'x-client-info': generateClientInfo(deviceId),
    'x-client-status': '0'
  };

  try {
    const res = await axios.get(BOOTSTRAP_URL, { headers, timeout: 12000 });
    const xUser = res.headers['x-user'];
    if (!xUser) throw new Error('Missing x-user token header from MovieBox bootstrap');
    const user = JSON.parse(xUser);
    cachedBearerToken = user.token;
    tokenExpiresAt = Date.now() + (45 * 60 * 1000); // 45 minute cache
    return cachedBearerToken;
  } catch (err) {
    console.warn('[MovieBox] Bootstrap token error:', err.message);
    throw err;
  }
}

/**
 * Perform authenticated request to Native MovieBox BFF
 */
async function nativeApiRequest(method, pathOrUrl, bodyDict = null, retry = true) {
  const token = await getAuthToken();
  const fullUrl = pathOrUrl.startsWith('http') ? pathOrUrl : `${NATIVE_API_BASE}${pathOrUrl}`;
  const ts = Date.now();
  const bodyStr = bodyDict ? JSON.stringify(bodyDict) : null;

  const headers = {
    'user-agent': MODERN_USER_AGENT,
    'accept': 'application/json',
    'content-type': 'application/json',
    'authorization': `Bearer ${token}`,
    'connection': 'keep-alive',
    'x-client-token': generateXClientToken(ts),
    'x-tr-signature': generateSignature(method, 'application/json', 'application/json', fullUrl, bodyStr, ts),
    'x-client-info': generateClientInfo(deviceId),
    'x-client-status': '0'
  };

  try {
    const res = method.toUpperCase() === 'POST'
      ? await axios.post(fullUrl, bodyStr, { headers, timeout: 15000 })
      : await axios.get(fullUrl, { headers, timeout: 15000 });

    return res.data;
  } catch (err) {
    if (retry && err.response && (err.response.status === 401 || err.response.status === 441)) {
      await getAuthToken(true);
      return nativeApiRequest(method, pathOrUrl, bodyDict, false);
    }
    throw err;
  }
}

/**
 * Search MovieBox titles with clean sanitization
 */
async function searchMovieBox(query) {
  if (!query || typeof query !== 'string') return [];
  const cleanQ = query.trim().toLowerCase();
  if (searchCache.has(cleanQ)) {
    return searchCache.get(cleanQ);
  }

  try {
    const payload = { keyword: query.trim(), page: 1, perPage: 12 };
    const res = await nativeApiRequest('POST', '/wefeed-mobile-bff/subject-api/search', payload);
    const data = res.data || {};
    const rawItems = data.items || data.list || [];

    const results = rawItems.map(item => {
      const sub = item.subject || item;
      return {
        subjectId: String(sub.subjectId || ''),
        title: sub.title || '',
        subjectType: sub.subjectType, // 1 = Movie, 2 = Series
        type: sub.subjectType === 1 ? 'movie' : 'series',
        releaseDate: sub.releaseDate || '',
        year: sub.releaseDate ? parseInt(sub.releaseDate.split('-')[0], 10) : null,
        imdbRating: sub.imdbRatingValue || '',
        genre: sub.genre || '',
        cover: sub.cover && sub.cover.url ? sub.cover.url : null,
        detailPath: sub.detailPath || '',
        language: sub.language || 'en'
      };
    }).filter(r => r.subjectId && r.title);

    searchCache.set(cleanQ, results);
    return results;
  } catch (err) {
    console.warn('[MovieBox] Search error for query:', query, err.message);
    return [];
  }
}

/**
 * Get detailed metadata including dubs / dual audio tracks
 */
async function getMovieBoxDetails(subjectId) {
  try {
    const url = `/wefeed-mobile-bff/subject-api/get?subjectId=${encodeURIComponent(subjectId)}`;
    const res = await nativeApiRequest('GET', url);
    const data = res.data || {};
    const detailUrlStr = data.detailUrl || '';
    const detailPath = detailUrlStr.includes('/') ? detailUrlStr.split('/').pop() : detailUrlStr;

    return {
      subjectId: String(data.subjectId || subjectId),
      title: data.title || '',
      subjectType: data.subjectType,
      type: data.subjectType === 1 ? 'movie' : 'series',
      description: data.description || '',
      releaseDate: data.releaseDate || '',
      duration: data.duration || 0,
      imdbRating: data.imdbRatingValue || '',
      detailPath,
      dubs: Array.isArray(data.dubs) ? data.dubs.map(d => ({
        subjectId: String(d.subjectId || ''),
        langName: d.lanName || d.language || '',
        language: d.language || '',
        detailPath: d.detailPath || ''
      })) : []
    };
  } catch (err) {
    console.warn('[MovieBox] Details lookup error for subject:', subjectId, err.message);
    return null;
  }
}

/**
 * Get verified seasons & episode breakdown, strictly filtering out dummy/unreleased seasons
 */
async function getMovieBoxSeasons(subjectId) {
  try {
    const url = `/wefeed-mobile-bff/subject-api/season-info?subjectId=${encodeURIComponent(subjectId)}`;
    const res = await nativeApiRequest('GET', url);
    const rawSeasons = (res.data && res.data.seasons) || [];

    // Filter out invalid, empty, or unreleased seasons
    return rawSeasons
      .filter(s => s && typeof s.se === 'number' && s.se >= 1 && (s.maxEp > 0 || (s.allEp && s.allEp.length > 0)))
      .map(s => {
        let epCount = s.maxEp || 0;
        if (!epCount && s.allEp) {
          const parts = String(s.allEp).split(',');
          epCount = parts.length;
        }
        return {
          season: s.se,
          episodeCount: epCount || 1,
          resolutions: s.resolutions || []
        };
      })
      .sort((a, b) => a.season - b.season);
  } catch (err) {
    console.warn('[MovieBox] Season info error for subject:', subjectId, err.message);
    return [];
  }
}

/**
 * Extract streaming playable URLs and captions for a specific title/episode
 */
async function extractStreamsForSubject(subjectId, season = 0, episode = 0, dubLabel = null) {
  const streams = [];
  const seenUrls = new Set();
  const se = parseInt(season, 10) || 0;
  const ep = parseInt(episode, 10) || 0;

  try {
    const playUrl = `/wefeed-mobile-bff/subject-api/play-info?subjectId=${encodeURIComponent(subjectId)}&se=${se}&ep=${ep}`;
    const res = await nativeApiRequest('GET', playUrl);
    const data = res.data || {};
    const rawStreams = data.streams || [];
    const captions = Array.isArray(data.captions) ? data.captions.map((c, idx) => ({
      title: c.lanName || c.lan || `Subtitle ${idx + 1}`,
      language: (c.lan || 'en').toLowerCase(),
      uri: c.url || ''
    })).filter(c => c.uri) : [];

    rawStreams.forEach((st, idx) => {
      const url = st.url;
      if (!url || seenUrls.has(url) || url.includes('b164fbfb4347792950bdfbfb563d39d9')) return;
      seenUrls.add(url);

      const resStr = String(st.resolutions || '');
      let quality = '1080p';
      if (resStr.includes('2160') || resStr.includes('4k')) quality = '4K Ultra';
      else if (resStr.includes('1080')) quality = '1080p';
      else if (resStr.includes('720')) quality = '720p';
      else if (resStr.includes('480')) quality = '480p';

      const isHindi = dubLabel && (dubLabel.toLowerCase().includes('hindi') || dubLabel.toLowerCase().includes('dub'));
      const serverTitle = isHindi
        ? `MovieBox Core (Hindi Dubbed ${quality})`
        : `MovieBox VIP Core (${quality} Fast CDN)`;

      streams.push({
        server: serverTitle,
        link: url,
        type: 'mp4',
        quality,
        hasHindiAudio: !!isHindi,
        audioTrack: isHindi ? 'Hindi' : 'Original / English',
        subtitles: captions,
        source: 'moviebox_native',
        headers: {
          'User-Agent': MODERN_USER_AGENT,
          'Referer': 'https://api3.aoneroom.com/'
        }
      });
    });
  } catch (err) {
    console.warn('[MovieBox] Native stream extraction warning:', err.message);
  }

  return streams;
}

/**
 * Universal Stream Resolver:
 * Takes title, year, media type, season, and episode.
 * Matches best title on MovieBox, extracts both original streams AND any Hindi/Dual Audio dubs!
 */
async function resolveMovieBoxStreams({ title, year, type = 'movie', season = 1, episode = 1, preferredAudio = null }) {
  if (!title) return [];
  const isTv = type === 'tv' || type === 'series';
  const cleanTitle = title.replace(/[^\w\s]/gi, ' ').trim();

  // Search for the title
  let results = await searchMovieBox(cleanTitle);

  // If initial search produced few results, try without special suffixes
  if (results.length === 0 && cleanTitle.includes(' ')) {
    const primaryWord = cleanTitle.split(' ').slice(0, 3).join(' ');
    results = await searchMovieBox(primaryWord);
  }

  if (results.length === 0) return [];

  // Filter matching type (movie vs series)
  const targetType = isTv ? 'series' : 'movie';
  const typedResults = results.filter(r => r.type === targetType);
  const candidates = typedResults.length > 0 ? typedResults : results;

  // Best match selection
  let primaryCandidate = candidates[0];
  if (year) {
    const yr = parseInt(year, 10);
    const yrMatch = candidates.find(r => r.year && Math.abs(r.year - yr) <= 1);
    if (yrMatch) primaryCandidate = yrMatch;
  }

  if (!primaryCandidate) return [];

  const streams = [];

  // 1. Extract Primary / Original Stream
  const sNum = isTv ? (parseInt(season, 10) || 1) : 0;
  const epNum = isTv ? (parseInt(episode, 10) || 1) : 0;

  const originalStreams = await extractStreamsForSubject(primaryCandidate.subjectId, sNum, epNum, null);
  streams.push(...originalStreams);

  // 2. Multi-Audio / Dual Audio (Hindi Dub) Auto-Discovery
  // Check if a dedicated Hindi version exists in search results (e.g. "Avatar [Hindi]")
  const hindiCandidate = candidates.find(c => 
    c.subjectId !== primaryCandidate.subjectId &&
    (c.title.toLowerCase().includes('hindi') || c.title.toLowerCase().includes('dual'))
  );

  if (hindiCandidate) {
    const hindiStreams = await extractStreamsForSubject(hindiCandidate.subjectId, sNum, epNum, 'Hindi Dubbed');
    streams.push(...hindiStreams);
  }

  // Also inspect details dubs list if available
  try {
    const details = await getMovieBoxDetails(primaryCandidate.subjectId);
    if (details && Array.isArray(details.dubs)) {
      for (const dub of details.dubs) {
        if (dub.subjectId && dub.subjectId !== primaryCandidate.subjectId) {
          const isHindiDub = dub.langName.toLowerCase().includes('hindi') || dub.language.toLowerCase().includes('hi');
          const isEnglishDub = dub.langName.toLowerCase().includes('english') || dub.language.toLowerCase().includes('en');
          
          if (isHindiDub || isEnglishDub) {
            const dubStreams = await extractStreamsForSubject(dub.subjectId, sNum, epNum, dub.langName);
            streams.push(...dubStreams);
          }
        }
      }
    }
  } catch (e) {
    // Non-blocking dub lookup
  }

  // Sort streams: If user prefers Hindi or title is a Hindi release, Hindi streams go first
  const preferHindi = preferredAudio === 'hindi';
  streams.sort((a, b) => {
    if (preferHindi) {
      if (a.hasHindiAudio && !b.hasHindiAudio) return -1;
      if (!a.hasHindiAudio && b.hasHindiAudio) return 1;
    }
    return 0;
  });

  return streams;
}

module.exports = {
  searchMovieBox,
  getMovieBoxDetails,
  getMovieBoxSeasons,
  extractStreamsForSubject,
  resolveMovieBoxStreams
};
