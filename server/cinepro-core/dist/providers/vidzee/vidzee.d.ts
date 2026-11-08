import { BaseProvider } from '@omss/framework';
import type { ProviderCapabilities, ProviderMediaObject, ProviderResult } from '@omss/framework';
export declare class VidZeeProvider extends BaseProvider {
    readonly id = "vidzee";
    readonly name = "VidZee";
    readonly enabled = true;
    readonly BASE_URL = "https://core.vidzee.wtf";
    readonly PLAYER_URL = "https://player.vidzee.wtf";
    readonly HEADERS: {
        'User-Agent': string;
        Accept: string;
        'Accept-Language': string;
        Referer: string;
        Origin: string;
    };
    readonly capabilities: ProviderCapabilities;
    /**
     * Fetch movie sources
     */
    getMovieSources(media: ProviderMediaObject): Promise<ProviderResult>;
    /**
     * Fetch TV episode sources
     */
    getTVSources(media: ProviderMediaObject): Promise<ProviderResult>;
    /**
     * Main scraping logic - Parallel servers + FULL parallel decryption
     */
    private getSources;
    /**
     * Fetch single server response
     */
    private fetchServer;
    private fetchDecryptionKey;
    /**
     * Return empty result with diagnostic
     */
    private emptyResult;
    /**
     * Health check
     */
    healthCheck(): Promise<boolean>;
}
