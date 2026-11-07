/**
 * Pure business logic for CineStream:
 * - Streaming embed URL generation
 * - Watchlist state management
 * - Catalog filtering & search
 */

export type MediaType = 'movie' | 'tv';

export type ServerType =
  | 'vidlink'
  | 'vidsrc_pm'
  | 'autoembed'
  | 'vidsrc_su'
  | 'twoembed'
  | 'nexstream'
  | 'smashystream'
  | 'vidsrc_to'
  | 'vidsrc_me'
  | 'trailer';

export const DEFAULT_NEXSTREAM_API_KEY = 'nx_1412dc1c920d6e0b0b9cc0848e68ec2a';

export interface MediaItem {
  id: number;
  title: string;
  name?: string;
  media_type: MediaType;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  trailer_key?: string;
  imdb_id?: string;
  seasons_count?: number;
  episodes_per_season?: number[];
  original_language?: string;
}

/**
 * Builds the embed URL for the selected server, movie/show ID, season, and episode.
 * Supported servers:
 * - autoembed: Zero Sandbox Block, Multi-Audio (Hindi, English, Bengali sub), frame-ancestors *
 * - nexstream: VIP CodeSpecters streaming server with user API key
 * - smashystream: Multi-language dubbed streams (Hindi, Spanish, French, English)
 * - vidlink: High-speed Ultra HD player with audio/subtitle switcher
 * - vidsrc_su: Active fast VidSrc mirror
 * - vidsrc_to: Classic VidSrc.to
 * - vidsrc_me: VidSrc.me
 * - twoembed: 2Embed backup
 * - trailer: Official YouTube Trailer
 */
export function generateEmbedUrl(
  server: ServerType,
  tmdbId: number,
  mediaType: MediaType,
  season: number = 1,
  episode: number = 1,
  trailerKey?: string,
  imdbId?: string,
  nexstreamKey: string = DEFAULT_NEXSTREAM_API_KEY
): string {
  if (server === 'trailer') {
    if (!trailerKey) {
      return '';
    }
    return `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0`;
  }

  // 1. VidLink Pro (Fastest 1080p, Auto-audio & subtitles)
  if (server === 'vidlink') {
    if (mediaType === 'tv') {
      return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`;
    }
    return `https://vidlink.pro/movie/${tmdbId}`;
  }

  // 2. VidSrc PM (Ultra-reliable global player)
  if (server === 'vidsrc_pm') {
    if (mediaType === 'tv') {
      return `https://vidsrc.pm/embed/tv/${tmdbId}/${season}/${episode}`;
    }
    return `https://vidsrc.pm/embed/movie/${tmdbId}`;
  }

  // 3. AutoEmbed (Zero Sandbox Restriction, frame-ancestors *, Multi-Audio)
  if (server === 'autoembed') {
    if (mediaType === 'tv') {
      return `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}`;
    }
    return `https://autoembed.co/movie/tmdb/${tmdbId}`;
  }

  // 2. NexStream VIP (Direct API key provided by user)
  if (server === 'nexstream') {
    const key = nexstreamKey || DEFAULT_NEXSTREAM_API_KEY;
    if (mediaType === 'tv') {
      return `https://api.codespecters.com/embed/tv/${tmdbId}/${season}/${episode}?apikey=${key}`;
    }
    return `https://api.codespecters.com/embed/movie/${tmdbId}?apikey=${key}`;
  }

  // 4. SmashyStream (Multi-Language Dubbed Streams: Hindi, English, Spanish, etc.)
  if (server === 'smashystream') {
    if (mediaType === 'tv') {
      return `https://player.smashy.stream/tv/${tmdbId}?s=${season}&e=${episode}`;
    }
    return `https://player.smashy.stream/movie/${tmdbId}`;
  }

  if (server === 'vidsrc_su') {
    if (mediaType === 'tv') {
      return `https://vidsrc.su/embed/tv/${tmdbId}/${season}/${episode}`;
    }
    return `https://vidsrc.su/embed/movie/${tmdbId}`;
  }

  if (server === 'vidsrc_to') {
    const idParam = imdbId || tmdbId;
    if (mediaType === 'tv') {
      return `https://vidsrc.to/embed/tv/${idParam}/${season}/${episode}`;
    }
    return `https://vidsrc.to/embed/movie/${idParam}`;
  }

  if (server === 'vidsrc_me') {
    if (mediaType === 'tv') {
      return `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
    }
    return `https://vidsrc.me/embed/movie?tmdb=${tmdbId}${imdbId ? `&imdb=${imdbId}` : ''}`;
  }

  if (server === 'twoembed') {
    const idParam = imdbId || tmdbId;
    if (mediaType === 'tv') {
      return `https://www.2embed.cc/embedtv/${idParam}&s=${season}&e=${episode}`;
    }
    return `https://www.2embed.cc/embed/${idParam}`;
  }

  return `https://autoembed.co/movie/tmdb/${tmdbId}`;
}

/**
 * Watchlist pure helper functions
 */
export function isInWatchlist(list: MediaItem[], id: number): boolean {
  return list.some(item => item.id === id);
}

export function addToWatchlist(list: MediaItem[], item: MediaItem): MediaItem[] {
  if (isInWatchlist(list, item.id)) {
    return list;
  }
  return [item, ...list];
}

export function removeFromWatchlist(list: MediaItem[], id: number): MediaItem[] {
  return list.filter(item => item.id !== id);
}

export function toggleWatchlist(list: MediaItem[], item: MediaItem): { newList: MediaItem[]; added: boolean } {
  if (isInWatchlist(list, item.id)) {
    return { newList: removeFromWatchlist(list, item.id), added: false };
  }
  return { newList: addToWatchlist(list, item), added: true };
}

/**
 * Catalog filtering logic
 */
export interface FilterOptions {
  query?: string;
  mediaType?: 'all' | 'movie' | 'tv';
  genreId?: number | null;
}

export function filterCatalog(items: MediaItem[], options: FilterOptions): MediaItem[] {
  const query = (options.query || '').trim().toLowerCase();
  const mediaType = options.mediaType || 'all';
  const genreId = options.genreId;

  return items.filter(item => {
    // Media type filter
    if (mediaType !== 'all' && item.media_type !== mediaType) {
      return false;
    }

    // Genre filter
    if (genreId !== undefined && genreId !== null) {
      const hasGenre =
        (item.genre_ids && item.genre_ids.includes(genreId)) ||
        (item.genres && item.genres.some(g => g.id === genreId));
      if (!hasGenre) {
        return false;
      }
    }

    // Text search query
    if (query) {
      const title = (item.title || item.name || '').toLowerCase();
      const overview = (item.overview || '').toLowerCase();
      if (!title.includes(query) && !overview.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

export const DEFAULT_TMDB_API_KEY = '3c7e2985716f8f6a43a41e0dfff8bb96';
export const DEFAULT_TMDB_READ_ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzYzdlMjk4NTcxNmY4ZjZhNDNhNDFlMGRmZmY4YmI5NiIsIm5iZiI6MTc5NDA0MjgwMS4yMDIsInN1YiI6IjZhZWVlYmIxNzc3MzRhNzNkOTMyMDc4NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.g94o-sgA3YwCHuih_C_B-85vF2xbhnvX13wjOcRS7mg';

export interface TmdbCredentials {
  apiKey?: string;
  readToken?: string;
}

/**
 * Builds request URL and Authorization headers for TMDB API v3/v4
 */
export function buildTmdbRequest(
  endpoint: string,
  params: Record<string, string | number | undefined | null> = {},
  creds: TmdbCredentials = { apiKey: DEFAULT_TMDB_API_KEY, readToken: DEFAULT_TMDB_READ_ACCESS_TOKEN }
): { url: string; headers: Record<string, string> } {
  const base = endpoint.startsWith('http') ? endpoint : `https://api.themoviedb.org/3${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const url = new URL(base);

  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      url.searchParams.set(key, String(val));
    }
  });

  if (creds.apiKey && !url.searchParams.has('api_key')) {
    url.searchParams.set('api_key', creds.apiKey);
  }

  const headers: Record<string, string> = {
    Accept: 'application/json'
  };

  if (creds.readToken) {
    headers['Authorization'] = `Bearer ${creds.readToken}`;
  }

  return { url: url.toString(), headers };
}

/**
 * Sanitizes raw TMDB API response item into clean MediaItem format
 */
export function sanitizeTmdbItem(item: any, forcedType?: MediaType): MediaItem {
  return {
    id: item.id,
    title: item.title || item.name || 'Untitled',
    name: item.name,
    media_type: forcedType || item.media_type || (item.title ? 'movie' : 'tv'),
    overview: item.overview || '',
    poster_path: item.poster_path || '',
    backdrop_path: item.backdrop_path || item.poster_path || '',
    vote_average: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 7.5,
    vote_count: item.vote_count,
    release_date: item.release_date || item.first_air_date || '',
    first_air_date: item.first_air_date,
    genre_ids: item.genre_ids || [],
    genres: item.genres,
    imdb_id: item.external_ids ? item.external_ids.imdb_id : item.imdb_id,
    original_language: item.original_language
  };
}

/**
 * Common typo and transliteration corrections for Anime, Bengali, Hindi, and Global series/movies
 */
export const POPULAR_QUERY_CORRECTIONS: Record<string, string> = {
  narutu: 'Naruto',
  narutoo: 'Naruto',
  borutu: 'Boruto',
  panchayt: 'Panchayat',
  panchayet: 'Panchayat',
  panchat: 'Panchayat',
  stree: 'Stree 2',
  mirzapr: 'Mirzapur',
  mirzapurr: 'Mirzapur',
  jawan: 'Jawan',
  jawann: 'Jawan',
  animie: 'Anime',
  demonslayer: 'Demon Slayer',
  kimetsu: 'Demon Slayer',
  'attack on titen': 'Attack on Titan',
  shingeki: 'Attack on Titan',
  'jujutsu kaisen': 'Jujutsu Kaisen',
  jjk: 'Jujutsu Kaisen',
  sololeveling: 'Solo Leveling',
  strangerthigns: 'Stranger Things',
  'stranger thigns': 'Stranger Things',
  brekingbad: 'Breaking Bad',
  tofan: 'Toofan',
  priyotoma: 'Priyotoma',
  karagar: 'Karagar',
  bachelorpoint: 'Bachelor Point'
};

export function findSuggestedQuery(query: string): string | null {
  const clean = query.trim().toLowerCase();
  if (!clean) return null;
  if (POPULAR_QUERY_CORRECTIONS[clean]) {
    return POPULAR_QUERY_CORRECTIONS[clean];
  }
  // Check partial match
  for (const [typo, fix] of Object.entries(POPULAR_QUERY_CORRECTIONS)) {
    if (clean.includes(typo)) {
      return fix;
    }
  }
  return null;
}

/**
 * Continue Watching State & Pure Management
 */
export interface ContinueWatchingItem {
  id: number;
  title: string;
  name?: string;
  media_type: MediaType;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  season?: number;
  episode?: number;
  lastWatchedAt: number;
  progressPercent: number;
  server?: ServerType;
}

export const MAX_CONTINUE_WATCHING_ITEMS = 15;

/**
 * Adds or updates an item in the Continue Watching list.
 * Deduplicates by item id, pushes the latest to the front, and updates season/episode.
 */
export function addToContinueWatching(
  list: ContinueWatchingItem[],
  newItem: ContinueWatchingItem
): ContinueWatchingItem[] {
  const filtered = list.filter(item => item.id !== newItem.id);
  const updatedItem: ContinueWatchingItem = {
    ...newItem,
    lastWatchedAt: newItem.lastWatchedAt || Date.now(),
    progressPercent: newItem.progressPercent || 35
  };
  return [updatedItem, ...filtered].slice(0, MAX_CONTINUE_WATCHING_ITEMS);
}

/**
 * Removes an item from the Continue Watching list by ID.
 */
export function removeFromContinueWatching(
  list: ContinueWatchingItem[],
  id: number
): ContinueWatchingItem[] {
  return list.filter(item => item.id !== id);
}

/**
 * Clears the Continue Watching list.
 */
export function clearContinueWatching(): ContinueWatchingItem[] {
  return [];
}

