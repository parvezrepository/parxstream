import { BaseProvider } from '@omss/framework';
import type { ProviderCapabilities, ProviderMediaObject, ProviderResult } from '@omss/framework';
export declare class VixSrcProvider extends BaseProvider {
    readonly id = "vixsrc";
    readonly name = "VixSrc";
    readonly enabled = true;
    readonly BASE_URL = "https://vixsrc.to";
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
     * Main scraping logic
     */
    private getSources;
    /**
     * Build page URL based on media type
     */
    private buildPageUrl;
    /**
     * Fetch page HTML
     */
    private fetchApi;
    private fetchPage;
    /**
     * Extract token, expires, and playlist URL from HTML
     */
    private extractTokenData;
    /**
     * Check if token is expired
     */
    private isTokenExpired;
    /**
     * Build master playlist URL with token
     */
    private buildMasterUrl;
    /**
     * Fetch playlist content
     */
    private fetchPlaylist;
    /**
     * Parse HLS playlist content
     */
    private parsePlaylist;
    /**
     * Parse audio tracks from HLS manifest
     */
    private parseAudioTracks;
    /**
     * Parse subtitles from HLS manifest
     */
    private parseSubtitles;
    /**
     * Parse quality variants from HLS manifest
     */
    private parseVariants;
    /**
     * Return empty result with diagnostic
     */
    private emptyResult;
    /**
     * Health check
     */
    healthCheck(): Promise<boolean>;
}
