import type { ProviderCapabilities, ProviderMediaObject, ProviderResult } from '@omss/framework';
import { BaseProvider } from '@omss/framework';
export declare class AnyEmbed extends BaseProvider {
    readonly id = "anyembed";
    readonly name = "AnyEmbed";
    readonly enabled = false;
    readonly BASE_URL = "https://api.anyembed.xyz";
    readonly FRONTEND_URL = "https://anyembed.xyz";
    readonly HEADERS: {
        'User-Agent': string;
        accept: string;
        referer: string;
        origin: string;
        'x-session-token': string;
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
    getToken(): Promise<string>;
    /**
     * Health check
     */
    healthCheck(): Promise<boolean>;
    /**
     * Main scraping logic
     */
    private getSources;
    private getApiResponse;
    private mapToProviderResult;
    /**
     * Return empty result with diagnostic
     */
    private emptyResult;
}
