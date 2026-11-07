import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateEmbedUrl,
  isInWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  toggleWatchlist,
  filterCatalog,
  MediaItem,
  buildTmdbRequest,
  sanitizeTmdbItem,
  DEFAULT_TMDB_API_KEY,
  DEFAULT_TMDB_READ_ACCESS_TOKEN,
  findSuggestedQuery,
  DEFAULT_NEXSTREAM_API_KEY,
  addToContinueWatching,
  removeFromContinueWatching,
  clearContinueWatching,
  ContinueWatchingItem
} from './streaming.ts';

const sampleMovie: MediaItem = {
  id: 693134,
  title: 'Dune: Part Two',
  media_type: 'movie',
  overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge.',
  poster_path: '/5gzzkxmKo3fd0AmFv3w46i53oV6.jpg',
  backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520Stq.jpg',
  vote_average: 8.2,
  genre_ids: [878, 12],
  trailer_key: 'Way9Dexny3w'
};

const sampleShow: MediaItem = {
  id: 66732,
  title: 'Stranger Things',
  media_type: 'tv',
  overview: 'When a young boy vanishes, a small town uncovers a mystery.',
  poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
  backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
  vote_average: 8.6,
  genre_ids: [18, 878, 9648],
  trailer_key: 'b9EkMc79ZSU',
  seasons_count: 4,
  episodes_per_season: [8, 9, 8, 9]
};

test('generateEmbedUrl handles VidLink server for movies and TV series', () => {
  const movieUrl = generateEmbedUrl('vidlink', sampleMovie.id, 'movie');
  assert.equal(movieUrl, 'https://vidlink.pro/movie/693134');

  const tvUrl = generateEmbedUrl('vidlink', sampleShow.id, 'tv', 2, 4);
  assert.equal(tvUrl, 'https://vidlink.pro/tv/66732/2/4');
});

test('generateEmbedUrl handles VidSrc SU and VidSrc TO mirrors with season/episode params', () => {
  const suMovie = generateEmbedUrl('vidsrc_su', sampleMovie.id, 'movie');
  assert.equal(suMovie, 'https://vidsrc.su/embed/movie/693134');

  const suTv = generateEmbedUrl('vidsrc_su', sampleShow.id, 'tv', 3, 5);
  assert.equal(suTv, 'https://vidsrc.su/embed/tv/66732/3/5');

  const toTv = generateEmbedUrl('vidsrc_to', sampleShow.id, 'tv', 1, 2);
  assert.equal(toTv, 'https://vidsrc.to/embed/tv/66732/1/2');
});

test('generateEmbedUrl handles VidSrc ME and 2Embed servers', () => {
  const meMovie = generateEmbedUrl('vidsrc_me', sampleMovie.id, 'movie');
  assert.equal(meMovie, 'https://vidsrc.me/embed/movie?tmdb=693134');

  const meTv = generateEmbedUrl('vidsrc_me', sampleShow.id, 'tv', 2, 3);
  assert.equal(meTv, 'https://vidsrc.me/embed/tv?tmdb=66732&season=2&episode=3');

  const twoTv = generateEmbedUrl('twoembed', sampleShow.id, 'tv', 1, 4);
  assert.equal(twoTv, 'https://www.2embed.cc/embedtv/66732&s=1&e=4');
});

test('generateEmbedUrl handles official YouTube trailers', () => {
  const trailerUrl = generateEmbedUrl('trailer', sampleMovie.id, 'movie', 1, 1, sampleMovie.trailer_key);
  assert.equal(trailerUrl, 'https://www.youtube-nocookie.com/embed/Way9Dexny3w?autoplay=1&rel=0');

  const emptyTrailer = generateEmbedUrl('trailer', sampleMovie.id, 'movie', 1, 1, '');
  assert.equal(emptyTrailer, '');
});

test('watchlist state additions, checks, and removals work deterministically', () => {
  let list: MediaItem[] = [];
  assert.equal(isInWatchlist(list, sampleMovie.id), false);

  list = addToWatchlist(list, sampleMovie);
  assert.equal(list.length, 1);
  assert.equal(isInWatchlist(list, sampleMovie.id), true);

  // Duplicate add does not increase list size
  list = addToWatchlist(list, sampleMovie);
  assert.equal(list.length, 1);

  // Toggle off
  const res1 = toggleWatchlist(list, sampleMovie);
  assert.equal(res1.added, false);
  assert.equal(res1.newList.length, 0);

  // Toggle on
  const res2 = toggleWatchlist(res1.newList, sampleShow);
  assert.equal(res2.added, true);
  assert.equal(res2.newList.length, 1);
  assert.equal(res2.newList[0].id, sampleShow.id);

  // Removal
  const removed = removeFromWatchlist(res2.newList, sampleShow.id);
  assert.equal(removed.length, 0);
});

test('filterCatalog correctly filters by query, mediaType, and genre', () => {
  const catalog = [sampleMovie, sampleShow];

  // Search by query
  const searchResult = filterCatalog(catalog, { query: 'Paul' });
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].id, sampleMovie.id);

  // Filter by mediaType
  const tvResults = filterCatalog(catalog, { mediaType: 'tv' });
  assert.equal(tvResults.length, 1);
  assert.equal(tvResults[0].id, sampleShow.id);

  const movieResults = filterCatalog(catalog, { mediaType: 'movie' });
  assert.equal(movieResults.length, 1);
  assert.equal(movieResults[0].id, sampleMovie.id);

  // Filter by genre ID (878 is Sci-Fi, shared by both)
  const sciFiResults = filterCatalog(catalog, { genreId: 878 });
  assert.equal(sciFiResults.length, 2);

  // Filter by genre ID (12 is Adventure, only Dune has it)
  const adventureResults = filterCatalog(catalog, { genreId: 12 });
  assert.equal(adventureResults.length, 1);
  assert.equal(adventureResults[0].id, sampleMovie.id);
});

test('buildTmdbRequest constructs valid URL with query parameters and Authorization Bearer header', () => {
  const req = buildTmdbRequest('/trending/all/day', { page: 2 });
  assert.equal(req.url, `https://api.themoviedb.org/3/trending/all/day?page=2&api_key=${DEFAULT_TMDB_API_KEY}`);
  assert.equal(req.headers['Authorization'], `Bearer ${DEFAULT_TMDB_READ_ACCESS_TOKEN}`);
  assert.equal(req.headers['Accept'], 'application/json');
});

test('sanitizeTmdbItem properly extracts title, backdrop, and external IMDb ID', () => {
  const raw = {
    id: 157336,
    title: 'Interstellar',
    overview: 'A team of explorers travel through a wormhole.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    vote_average: 8.43,
    release_date: '2014-11-05',
    external_ids: { imdb_id: 'tt0816692' }
  };
  const sanitized = sanitizeTmdbItem(raw, 'movie');
  assert.equal(sanitized.id, 157336);
  assert.equal(sanitized.title, 'Interstellar');
  assert.equal(sanitized.media_type, 'movie');
  assert.equal(sanitized.vote_average, 8.4);
  assert.equal(sanitized.imdb_id, 'tt0816692');
});

test('generateEmbedUrl correctly builds AutoEmbed URLs for movies and TV series', () => {
  const movieUrl = generateEmbedUrl('autoembed', sampleMovie.id, 'movie');
  assert.equal(movieUrl, 'https://autoembed.co/movie/tmdb/693134');

  const tvUrl = generateEmbedUrl('autoembed', sampleShow.id, 'tv', 1, 3);
  assert.equal(tvUrl, 'https://autoembed.co/tv/tmdb/66732-1-3');
});

test('generateEmbedUrl correctly builds NexStream VIP URLs with API key', () => {
  const movieUrl = generateEmbedUrl('nexstream', 597, 'movie');
  assert.equal(movieUrl, `https://api.codespecters.com/embed/movie/597?apikey=${DEFAULT_NEXSTREAM_API_KEY}`);

  const tvUrl = generateEmbedUrl('nexstream', 1399, 'tv', 1, 1);
  assert.equal(tvUrl, `https://api.codespecters.com/embed/tv/1399/1/1?apikey=${DEFAULT_NEXSTREAM_API_KEY}`);
});

test('generateEmbedUrl correctly builds SmashyStream Multi-Audio URLs', () => {
  const movieUrl = generateEmbedUrl('smashystream', sampleMovie.id, 'movie');
  assert.equal(movieUrl, 'https://player.smashy.stream/movie/693134');

  const tvUrl = generateEmbedUrl('smashystream', sampleShow.id, 'tv', 2, 5);
  assert.equal(tvUrl, 'https://player.smashy.stream/tv/66732?s=2&e=5');
});

test('findSuggestedQuery fixes typos for popular anime, series, and movies', () => {
  assert.equal(findSuggestedQuery('narutu'), 'Naruto');
  assert.equal(findSuggestedQuery('panchayt'), 'Panchayat');
  assert.equal(findSuggestedQuery('stree'), 'Stree 2');
  assert.equal(findSuggestedQuery('demonslayer'), 'Demon Slayer');
  assert.equal(findSuggestedQuery('sololeveling'), 'Solo Leveling');
  assert.equal(findSuggestedQuery('unknownqueryxyz'), null);
});

test('addToContinueWatching stores and updates items at the front', () => {
  let list: ContinueWatchingItem[] = [];

  const movieItem: ContinueWatchingItem = {
    id: 693134,
    title: 'Dune: Part Two',
    media_type: 'movie',
    poster_path: '/5gzzkxmKo3fd0AmFv3w46i53oV6.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520Stq.jpg',
    vote_average: 8.2,
    lastWatchedAt: 1000,
    progressPercent: 45,
    server: 'autoembed'
  };

  list = addToContinueWatching(list, movieItem);
  assert.equal(list.length, 1);
  assert.equal(list[0].id, 693134);

  // Add a TV show with S1:E2
  const tvItem: ContinueWatchingItem = {
    id: 66732,
    title: 'Stranger Things',
    media_type: 'tv',
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    vote_average: 8.6,
    season: 1,
    episode: 2,
    lastWatchedAt: 2000,
    progressPercent: 60,
    server: 'autoembed'
  };

  list = addToContinueWatching(list, tvItem);
  assert.equal(list.length, 2);
  assert.equal(list[0].id, 66732); // latest added is at front

  // Update TV show to S1:E3
  const tvItemUpdated: ContinueWatchingItem = {
    ...tvItem,
    episode: 3,
    lastWatchedAt: 3000,
    progressPercent: 10
  };

  list = addToContinueWatching(list, tvItemUpdated);
  assert.equal(list.length, 2); // no duplicates
  assert.equal(list[0].id, 66732);
  assert.equal(list[0].episode, 3);
  assert.equal(list[1].id, 693134);

  // Removal
  list = removeFromContinueWatching(list, 693134);
  assert.equal(list.length, 1);
  assert.equal(list[0].id, 66732);

  // Clear
  list = clearContinueWatching();
  assert.equal(list.length, 0);
});

