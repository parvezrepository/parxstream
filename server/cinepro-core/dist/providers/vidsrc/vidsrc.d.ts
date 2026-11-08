import { BaseProvider } from '@omss/framework';
import type { ProviderCapabilities, ProviderMediaObject, ProviderResult } from '@omss/framework';
export declare class VidSrcProvider extends BaseProvider {
    readonly id = "vidsrc";
    readonly name = "VidSrc";
    readonly enabled = true;
    readonly BASE_URL = "https://vsembed.ru/";
    readonly HEADERS: {
        'User-Agent': string;
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
     * Main scraping logic
     */
    private getSources;
    /**
     * Build page URL based on media type
     */
    private buildPageUrl;
    /**
     * Fetch page HTML
     */
    private fetchPage;
    /**
     * Extract token, expires, and playlist URL from HTML
     */
    private extractSecondUrl;
    /**
     * Extract third URL from inline JS (loadIframe)
     * and resolve it against the second URL domain
     */
    private extractThirdUrl;
    private extractM3u8Urls;
    /**
     * Return empty result with diagnostic
     */
    private emptyResult;
    /**
     * Health check
     */
    healthCheck(): Promise<boolean>;
}
