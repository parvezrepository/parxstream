import { BaseProvider } from '@omss/framework';
import type { ProviderCapabilities, ProviderMediaObject, ProviderResult } from '@omss/framework';
export declare class VidRockProvider extends BaseProvider {
    readonly id = "vidrock";
    readonly name = "VidRock";
    readonly enabled = true;
    readonly BASE_URL = "https://vidrock.net/";
    readonly SUB_BASE_URL = "https://sub.vdrk.site";
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
    private getSources;
    private fetchSubtitles;
    private buildUrl;
    private fetchPage;
    private emptyResult;
    healthCheck(): Promise<boolean>;
}
