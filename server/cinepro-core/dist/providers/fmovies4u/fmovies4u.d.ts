import { BaseProvider } from '@omss/framework';
import type { ProviderCapabilities, ProviderMediaObject, ProviderResult } from '@omss/framework';
export declare class Fmovies4U extends BaseProvider {
    readonly id = "fmovies4u";
    readonly name = "Fmovies4U";
    readonly enabled = false;
    readonly BASE_URL = "https://fmovies4u.com";
    readonly HEADERS: {
        'User-Agent': string;
        Accept: string;
        'Accept-Language': string;
        Referer: string;
    };
    readonly capabilities: ProviderCapabilities;
    /**
     * Fetch movie sources
     */
    getMovieSources(media: ProviderMediaObject): Promise<ProviderResult>;
    /**
     * Fetch TV episode sources
     */
    getTVSources(media: ProviderMediaObject): Promise<ProviderResult>;
    /**
     * Shared movie/TV fetcher
     */
    private getSources;
    /**
     * Map decrypted API response to OMSS ProviderResult
     */
    private mapApiResponseToResult;
    /**
     * Build correct referer URL for given server number
     * @param media media object
     */
    private buildRefererUrl;
    /**
     * Return empty result with diagnostic
     */
    private emptyResult;
    /**
     * Health check
     */
    healthCheck(): Promise<boolean>;
}
