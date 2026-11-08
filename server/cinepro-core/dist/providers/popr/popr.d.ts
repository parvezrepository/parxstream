import { BaseProvider } from '@omss/framework';
import type { ProviderCapabilities, ProviderMediaObject, ProviderResult } from '@omss/framework';
export declare class PoprProvider extends BaseProvider {
    readonly id = "popr";
    readonly name = "Popr";
    readonly enabled = true;
    readonly BASE_URL = "https://popr.ink";
    readonly HEADERS: {
        'User-Agent': string;
        Referer: string;
    };
    readonly capabilities: ProviderCapabilities;
    getMovieSources(media: ProviderMediaObject): Promise<ProviderResult>;
    getTVSources(media: ProviderMediaObject): Promise<ProviderResult>;
    private checkStreamType;
    private fetchSource;
    private emptyResult;
    healthCheck(): Promise<boolean>;
}
