import type { ProviderCapabilities, ProviderMediaObject, ProviderResult } from '@omss/framework';
import { BaseProvider } from '@omss/framework';
export declare class StreamMafiaProvider extends BaseProvider {
    readonly id = "streammafia";
    readonly name = "MafiaEmbed";
    readonly enabled = true;
    readonly BASE_URL = "https://player.nhdapi.com";
    readonly HEADERS: {
        'User-Agent': string;
        Accept: string;
        'Accept-Language': string;
        Referer: string;
        Origin: string;
        Cookie: string;
        'x-api-token': string;
        'x-content-id': string;
    };
    readonly capabilities: ProviderCapabilities;
    getMovieSources(media: ProviderMediaObject): Promise<ProviderResult>;
    getTVSources(media: ProviderMediaObject): Promise<ProviderResult>;
    healthCheck(): Promise<boolean>;
    private getSources;
    private getToken;
    private getSessionCookie;
    private buildPageUrl;
    private fetchPage;
    private mapApiResponse;
    private resolveSwitch;
    private extractSourcesFromApi;
    private extractAudioTrack;
    private parseHLS;
    private parseVariants;
    private parseAudioTracks;
    private inferSourceType;
    private normalizeQuality;
    private emptyResult;
}
