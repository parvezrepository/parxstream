import type { ProviderCapabilities, ProviderMediaObject, ProviderResult } from '@omss/framework';
import { BaseProvider } from '@omss/framework';
export declare class MovieDownloader extends BaseProvider {
    readonly id = "02moviedownloader";
    readonly name = "02MovieDownloader";
    readonly enabled = false;
    readonly BASE_URL = "https://02moviedownloader.site";
    readonly HEADERS: {
        'User-Agent': string;
        accept: string;
        'accept-language': string;
        'cache-control': string;
        pragma: string;
        'sec-ch-ua-mobile': string;
        'sec-ch-ua-platform': string;
        'sec-fetch-dest': string;
        'sec-fetch-mode': string;
        'sec-fetch-site': string;
        'sec-gpc': string;
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
    getToken(media: ProviderMediaObject): Promise<string>;
    /**
     * Health check
     */
    healthCheck(): Promise<boolean>;
    /**
     * Main scraping logic
     */
    private getSources;
    private mapToProviderResult;
    private decryptPayload;
    private buildPageUrl;
    private fetchPage;
    /**
     * Return empty result with diagnostic
     */
    private emptyResult;
}
