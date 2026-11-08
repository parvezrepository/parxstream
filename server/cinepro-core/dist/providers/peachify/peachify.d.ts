import { BaseProvider } from '@omss/framework';
import type { ProviderCapabilities, ProviderMediaObject, ProviderResult } from '@omss/framework';
export declare class PeachifyProvider extends BaseProvider {
    readonly id = "Peachify";
    readonly name = "Peachify";
    readonly enabled = true;
    readonly BASE_URL = "https://peachify.top";
    readonly MOVIEBOX_URL = "https://uwu.eat-peach.sbs";
    readonly API_URL = "https://usa.eat-peach.sbs";
    readonly HEADERS: {
        'User-Agent': string;
        Accept: string;
        'Accept-Language': string;
        Referer: string;
        Origin: string;
    };
    readonly PEACHIFY_SERVERS: string[];
    readonly capabilities: ProviderCapabilities;
    getMovieSources(media: ProviderMediaObject): Promise<ProviderResult>;
    getTVSources(media: ProviderMediaObject): Promise<ProviderResult>;
    /**
     * fans out requests to all known peachify servers in parallel,
     * then merges whatever came back. partial failures are reported
     * as diagnostics rather than hard errors so the caller still
     * gets usable sources from the servers that did respond.
     */
    private getSources;
    /**
     * hits a single peachify api server, handles decryption if needed,
     * and maps the raw response into the omss provider result shape.
     */
    private fetchFromServer;
    /**
     * constructs the api path for a given server base url and media object.
     * tv paths append season and episode after the tmdb id.
     */
    private buildApiUrl;
    /**
     * extracts a usable source from a raw peachify source object.
     * the provider uses several different field names for the same data
     * depending on the server, so we probe each known alias in priority order.
     */
    private parseSource;
    /**
     * extracts subtitle data from a raw peachify subtitle entry.
     * returns null if no url is present.
     */
    private parseSubtitle;
    /**
     * returns the first non-empty string value found among the given keys.
     */
    private pickString;
    /**
     * rough quality guess when the provider only gives us a bitrate.
     * thresholds are conservative — better to under-label than over-promise.
     */
    private inferQualityFromBandwidth;
    /**
     * returns the first finite numeric value found among the given keys.
     * also handles string fields that embed a resolution-like number (e.g. "1080p").
     */
    private pickNumber;
    /**
     * maps peachify dub label aliases to a clean display string.
     * "dubbed" → "Dub", "subbed" → "Sub", anything else is title-cased as-is.
     */
    private normalizeDubLabel;
    /**
     * converts a loosely-typed headers object into a clean Record<string, string>.
     * drops entries with empty keys or null/undefined values.
     */
    private normalizeHeaders;
    private emptyResult;
    healthCheck(): Promise<boolean>;
}
