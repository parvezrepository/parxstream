
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  avatar: 'avatar',
  isKids: 'isKids',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  token: 'token',
  userAgent: 'userAgent',
  ipAddress: 'ipAddress',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.MovieScalarFieldEnum = {
  id: 'id',
  tmdbId: 'tmdbId',
  imdbId: 'imdbId',
  title: 'title',
  originalTitle: 'originalTitle',
  overview: 'overview',
  releaseDate: 'releaseDate',
  runtime: 'runtime',
  posterPath: 'posterPath',
  backdropPath: 'backdropPath',
  voteAverage: 'voteAverage',
  voteCount: 'voteCount',
  popularity: 'popularity',
  originalLanguage: 'originalLanguage',
  originCountry: 'originCountry',
  productionCountry: 'productionCountry',
  isAnime: 'isAnime',
  isCartoon: 'isCartoon',
  isAllowed: 'isAllowed',
  status: 'status',
  genres: 'genres',
  castSummary: 'castSummary',
  director: 'director',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SeriesScalarFieldEnum = {
  id: 'id',
  tmdbId: 'tmdbId',
  imdbId: 'imdbId',
  title: 'title',
  originalTitle: 'originalTitle',
  overview: 'overview',
  firstAirDate: 'firstAirDate',
  lastAirDate: 'lastAirDate',
  posterPath: 'posterPath',
  backdropPath: 'backdropPath',
  voteAverage: 'voteAverage',
  voteCount: 'voteCount',
  popularity: 'popularity',
  originalLanguage: 'originalLanguage',
  originCountry: 'originCountry',
  productionCountry: 'productionCountry',
  isAnime: 'isAnime',
  isCartoon: 'isCartoon',
  isWebSeries: 'isWebSeries',
  isAllowed: 'isAllowed',
  status: 'status',
  genres: 'genres',
  castSummary: 'castSummary',
  numberOfSeasons: 'numberOfSeasons',
  numberOfEpisodes: 'numberOfEpisodes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SeasonScalarFieldEnum = {
  id: 'id',
  seriesId: 'seriesId',
  seasonNumber: 'seasonNumber',
  title: 'title',
  overview: 'overview',
  posterPath: 'posterPath',
  airDate: 'airDate',
  episodeCount: 'episodeCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EpisodeScalarFieldEnum = {
  id: 'id',
  seasonId: 'seasonId',
  episodeNumber: 'episodeNumber',
  title: 'title',
  overview: 'overview',
  stillPath: 'stillPath',
  airDate: 'airDate',
  runtime: 'runtime',
  voteAverage: 'voteAverage',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ExternalContentIDScalarFieldEnum = {
  id: 'id',
  provider: 'provider',
  externalId: 'externalId',
  movieId: 'movieId',
  seriesId: 'seriesId',
  detailPath: 'detailPath',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VideoSourceScalarFieldEnum = {
  id: 'id',
  movieId: 'movieId',
  episodeId: 'episodeId',
  provider: 'provider',
  format: 'format',
  quality: 'quality',
  qualityValue: 'qualityValue',
  url: 'url',
  signCookie: 'signCookie',
  sizeMb: 'sizeMb',
  codec: 'codec',
  isAuthorized: 'isAuthorized',
  isHealthy: 'isHealthy',
  failureCount: 'failureCount',
  lastChecked: 'lastChecked',
  latencyMs: 'latencyMs',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AudioTrackScalarFieldEnum = {
  id: 'id',
  movieId: 'movieId',
  episodeId: 'episodeId',
  language: 'language',
  langCode: 'langCode',
  label: 'label',
  isDefault: 'isDefault',
  isDubbed: 'isDubbed',
  url: 'url',
  createdAt: 'createdAt'
};

exports.Prisma.SubtitleTrackScalarFieldEnum = {
  id: 'id',
  movieId: 'movieId',
  episodeId: 'episodeId',
  language: 'language',
  langCode: 'langCode',
  label: 'label',
  format: 'format',
  url: 'url',
  isDefault: 'isDefault',
  createdAt: 'createdAt'
};

exports.Prisma.WatchlistScalarFieldEnum = {
  id: 'id',
  profileId: 'profileId',
  movieId: 'movieId',
  seriesId: 'seriesId',
  createdAt: 'createdAt'
};

exports.Prisma.WatchHistoryScalarFieldEnum = {
  id: 'id',
  profileId: 'profileId',
  movieId: 'movieId',
  seriesId: 'seriesId',
  episodeId: 'episodeId',
  watchedAt: 'watchedAt',
  completed: 'completed'
};

exports.Prisma.WatchProgressScalarFieldEnum = {
  id: 'id',
  profileId: 'profileId',
  movieId: 'movieId',
  seriesId: 'seriesId',
  episodeId: 'episodeId',
  seasonNumber: 'seasonNumber',
  episodeNumber: 'episodeNumber',
  currentTime: 'currentTime',
  duration: 'duration',
  percentage: 'percentage',
  updatedAt: 'updatedAt'
};

exports.Prisma.RatingScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  movieId: 'movieId',
  seriesId: 'seriesId',
  score: 'score',
  createdAt: 'createdAt'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  movieId: 'movieId',
  seriesId: 'seriesId',
  content: 'content',
  createdAt: 'createdAt'
};

exports.Prisma.DisclaimerAcceptanceScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  version: 'version',
  ipAddress: 'ipAddress',
  acceptedAt: 'acceptedAt'
};

exports.Prisma.RightsRecordScalarFieldEnum = {
  id: 'id',
  movieId: 'movieId',
  seriesId: 'seriesId',
  rightsOwner: 'rightsOwner',
  authorizationStatus: 'authorizationStatus',
  licenseStart: 'licenseStart',
  licenseExpiry: 'licenseExpiry',
  allowedTerritories: 'allowedTerritories',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.TakedownRequestScalarFieldEnum = {
  id: 'id',
  claimantName: 'claimantName',
  email: 'email',
  contentTitle: 'contentTitle',
  tmdbId: 'tmdbId',
  reason: 'reason',
  evidenceUrl: 'evidenceUrl',
  status: 'status',
  actionNotes: 'actionNotes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SyncJobScalarFieldEnum = {
  id: 'id',
  jobType: 'jobType',
  status: 'status',
  itemsImported: 'itemsImported',
  itemsUpdated: 'itemsUpdated',
  itemsSkipped: 'itemsSkipped',
  errorMessage: 'errorMessage',
  startedAt: 'startedAt',
  completedAt: 'completedAt'
};

exports.Prisma.AdminLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  target: 'target',
  details: 'details',
  ipAddress: 'ipAddress',
  createdAt: 'createdAt'
};

exports.Prisma.SystemSettingsScalarFieldEnum = {
  key: 'key',
  value: 'value',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  User: 'User',
  Profile: 'Profile',
  Session: 'Session',
  Movie: 'Movie',
  Series: 'Series',
  Season: 'Season',
  Episode: 'Episode',
  ExternalContentID: 'ExternalContentID',
  VideoSource: 'VideoSource',
  AudioTrack: 'AudioTrack',
  SubtitleTrack: 'SubtitleTrack',
  Watchlist: 'Watchlist',
  WatchHistory: 'WatchHistory',
  WatchProgress: 'WatchProgress',
  Rating: 'Rating',
  Review: 'Review',
  DisclaimerAcceptance: 'DisclaimerAcceptance',
  RightsRecord: 'RightsRecord',
  TakedownRequest: 'TakedownRequest',
  SyncJob: 'SyncJob',
  AdminLog: 'AdminLog',
  SystemSettings: 'SystemSettings'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
