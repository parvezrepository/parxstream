import { BaseProvider } from '@omss/framework';
import type { ProviderCapabilities, ProviderMediaObject, ProviderResult } from '@omss/framework';
export declare class TulnexProvider extends BaseProvider {
    readonly id = "tulnex";
    readonly name = "Tulnex";
    readonly enabled = true;
    readonly BASE_URL = "https://api.tulnex.com";
    readonly HEADERS: {
        'User-Agent': string;
        accept: string;
        'accept-language': string;
        'cache-control': string;
    };
    readonly SERVERS: string[];
    readonly capabilities: ProviderCapabilities;
    getMovieSources(media: ProviderMediaObject): Promise<ProviderResult>;
    getTVSources(media: ProviderMediaObject): Promise<ProviderResult>;
    private getSources;
    private doScrape;
    private emptyResult;
    healthCheck(): Promise<boolean>;
}
