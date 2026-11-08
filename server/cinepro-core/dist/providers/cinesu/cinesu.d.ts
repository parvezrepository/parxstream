import { BaseProvider } from '@omss/framework';
import type { ProviderCapabilities, ProviderMediaObject, ProviderResult } from '@omss/framework';
export declare class CineSuProvider extends BaseProvider {
    readonly id = "CineSu";
    readonly name = "CineSu";
    readonly enabled = true;
    readonly BASE_URL = "https://cine.su";
    readonly HEADERS: {
        'User-Agent': string;
        Accept: string;
        'Accept-Language': string;
        Referer: string;
        Origin: string;
    };
    readonly capabilities: ProviderCapabilities;
    getMovieSources(media: ProviderMediaObject): Promise<ProviderResult>;
    getTVSources(media: ProviderMediaObject): Promise<ProviderResult>;
    /**
     * Core logic
     */
    private getSources;
    /**
     * Test if URL is accessible
     */
    private testUrl;
    /**
     * Build Manifest URL
     */
    private buildManifestUrl;
    private emptyResult;
    healthCheck(): Promise<boolean>;
}
