import { BaseProvider } from '@omss/framework';
import type { ProviderCapabilities, ProviderMediaObject, ProviderResult } from '@omss/framework';
export declare class FsharetvProvider extends BaseProvider {
    readonly id = "fsharetv";
    readonly name = "FshareTV";
    readonly enabled = true;
    readonly BASE_URL = "https://fsharetv.cc";
    private readonly TRAILER;
    readonly HEADERS: {
        'User-Agent': string;
        Accept: string;
        'Accept-Language': string;
        Referer: string;
    };
    private readonly API_HEADERS;
    readonly capabilities: ProviderCapabilities;
    getMovieSources(media: ProviderMediaObject): Promise<ProviderResult>;
    getTVSources(_media: ProviderMediaObject): Promise<ProviderResult>;
    healthCheck(): Promise<boolean>;
    private findWatchPath;
    private extractSourceId;
    private fetchApi;
    private mapToProviderResult;
    private emptyResult;
}
