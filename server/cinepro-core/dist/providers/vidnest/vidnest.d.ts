import { BaseProvider } from '@omss/framework';
import type { ProviderCapabilities, ProviderMediaObject, ProviderResult } from '@omss/framework';
export declare class VidNestProvider extends BaseProvider {
    readonly id = "vidnest";
    readonly name = "VidNest";
    readonly enabled = true;
    readonly BASE_URL = "https://vidnest.fun";
    readonly API_BASE_URL = "https://new.vidnest.fun";
    readonly HEADERS: Record<string, string>;
    /**
     * ALL servers (some unsupported)
     */
    private readonly SERVERS;
    private readonly handlers;
    readonly capabilities: ProviderCapabilities;
    getMovieSources(media: ProviderMediaObject): Promise<ProviderResult>;
    getTVSources(media: ProviderMediaObject): Promise<ProviderResult>;
    private getSources;
    private handleServer;
    private buildMovieUrl;
    private buildTvUrl;
    private fetchVidnest;
    private inferSourceType;
    private inferSubtitleFormat;
}
