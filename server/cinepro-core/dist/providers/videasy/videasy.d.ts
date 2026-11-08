import { BaseProvider } from '@omss/framework';
import type { ProviderCapabilities, ProviderMediaObject, ProviderResult } from '@omss/framework';
export declare class VideasyProvider extends BaseProvider {
    readonly id = "Videasy";
    readonly name = "Videasy";
    readonly enabled = true;
    readonly BASE_URL = "https://api.videasy.net";
    readonly HEADERS: {
        'User-Agent': string;
        Accept: string;
        Referer: string;
        Origin: string;
    };
    readonly capabilities: ProviderCapabilities;
    getMovieSources(media: ProviderMediaObject): Promise<ProviderResult>;
    getTVSources(media: ProviderMediaObject): Promise<ProviderResult>;
    private getSources;
    private fetchFromServer;
    private buildParams;
    private detectType;
    private normalizeQuality;
    private resolveLanguage;
    private resolveLanguageLabel;
    private emptyResult;
    healthCheck(): Promise<boolean>;
}
