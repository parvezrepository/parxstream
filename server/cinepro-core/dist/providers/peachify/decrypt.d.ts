import type { PeachifyApiResponse } from './peachify.types.js';
/**
 * Decrypt a Peachify API response payload.
 */
export default function decryptPayload(payload: string): Promise<PeachifyApiResponse | null>;
