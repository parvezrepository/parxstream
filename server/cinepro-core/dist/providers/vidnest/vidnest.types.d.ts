export interface encryptedResponse {
    encrypted: boolean;
    data: string;
}
export interface klikxxiResponse {
    sources: Source[];
    title: string;
    year: string;
}
export interface Source {
    quality: string;
    type: string;
    url: string;
}
export interface allmoviesResponse {
    streams: vidlinkStream[];
    totalLanguages: number;
}
export interface vidlinkStream {
    headers: Record<string, string>;
    language: string;
    type: string;
    url: string;
}
export interface onehdResponse {
    headers: Record<string, string>;
    subtitles: Subtitle[];
    url: string;
}
export interface Subtitle {
    lang: string;
    url: string;
}
export interface hollymoviehdResponse {
    sources: hollymoviehdSource[];
    success: boolean;
}
export interface hollymoviehdSource {
    file: string;
    label: string;
    type: string;
}
export interface vidlinkResponse {
    data: vidlinkData;
    headers: Record<string, string>;
    provider: string;
}
export interface vidlinkData {
    sourceId: string;
    stream: vidlinkStream;
}
export interface vidlinkStream {
    TTL: number;
    captions: Caption[];
    flags: string[];
    id: string;
    playlist: string;
    type: string;
}
export interface Caption {
    hasCorsRestrictions: boolean;
    id: string;
    language: string;
    type: string;
    url: string;
}
export interface deltaResponse {
    streams: deltaStream[];
    totalLanguages: number;
}
export interface deltaStream {
    headers: Record<string, string>;
    language: string;
    type: string;
    url: string;
}
export interface purstreamResponse {
    purstream_id: number;
    sources: purstreamSource[];
    title: string;
}
export interface purstreamSource {
    format: string;
    name: string;
    url: string;
}
export interface movieboxSource {
    headers: Record<string, string>;
    needConfig: boolean;
    provider: string;
    proxy: boolean;
    url: movieboxUrl[];
}
export interface movieboxUrl {
    lang: string;
    link: string;
    resolution: string;
    type: string;
}
export interface ServerMap {
    allmovies: allmoviesResponse;
    hollymoviehd: hollymoviehdResponse;
    vidlink: vidlinkResponse;
    onehd: onehdResponse;
    klikxxi: klikxxiResponse;
    purstream: purstreamResponse;
    delta: deltaResponse;
    moviebox: movieboxSource;
}
export type SupportedServer = keyof ServerMap;
