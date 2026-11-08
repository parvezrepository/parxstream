import { BaseProvider } from '@omss/framework';
import type { ProviderCapabilities, ProviderMediaObject, ProviderResult } from '@omss/framework';
export declare class VidApiProvider extends BaseProvider {
    readonly id = "vidapi";
    readonly name = "VidApi";
    readonly enabled = true;
    readonly BASE_URL = "https://vaplayer.ru";
    readonly IFRAME_URL = "https://brightpathsignals.com";
    readonly API_URL = "https://streamdata.vaplayer.ru/api.php";
    readonly HEADERS: {
        'User-Agent': string;
        Referer: string;
        Origin: string;
        Accept: string;
    };
    readonly capabilities: ProviderCapabilities;
    getMovieSources(media: ProviderMediaObject): Promise<ProviderResult>;
    getTVSources(media: ProviderMediaObject): Promise<ProviderResult>;
    private getSources;
    private emptyResult;
    healthCheck(): Promise<boolean>;
}
