import { BaseProvider } from '@omss/framework';
import type { ProviderCapabilities, ProviderMediaObject, ProviderResult } from '@omss/framework';
export declare class IcefyProvider extends BaseProvider {
    readonly id = "Icefy";
    readonly name = "Icefy";
    readonly enabled = true;
    readonly BASE_URL = "https://streams.icefy.top";
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
     * Build API URL
     */
    private buildApiUrl;
    private emptyResult;
    healthCheck(): Promise<boolean>;
}
