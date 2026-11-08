import type { ApiResponse } from './streammafia.types.js';
export declare function decryptStreamMafia(payload: {
    iv: string;
    tag: string;
    data: string;
}): ApiResponse;
