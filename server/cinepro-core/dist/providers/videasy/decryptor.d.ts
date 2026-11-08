export interface DecryptedPayload {
    sources: Array<{
        quality?: string;
        url: string;
        type?: string;
    }>;
    subtitles: Array<{
        url: string;
        lang?: string;
        language?: string;
    }>;
}
export declare function decryptResponse(blob: string, tmdbId: string): Promise<DecryptedPayload | null>;
