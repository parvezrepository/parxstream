export function extractUrl(data) {
    if (!data)
        return null;
    const wrap = (url, headers = null) => {
        if (!url || typeof url !== 'string' || !url.includes('http'))
            return null;
        return { url, headers };
    };
    if (typeof data === 'string' && data.includes('http'))
        return wrap(data);
    const d = data;
    const headers = d.headers ?? null;
    if (typeof d.url === 'string' && d.url.includes('http'))
        return wrap(d.url, headers);
    if (typeof d.stream === 'string' && d.stream.includes('http'))
        return wrap(d.stream, headers);
    if (typeof d.playlist === 'string' && d.playlist.includes('http'))
        return wrap(d.playlist, headers);
    if (typeof d.streamUrl === 'string' && d.streamUrl.includes('http'))
        return wrap(d.streamUrl, headers);
    if (typeof d.stream_url === 'string' && d.stream_url.includes('http'))
        return wrap(d.stream_url, headers);
    if (typeof d.streaming_url === 'string' && d.streaming_url.includes('http'))
        return wrap(d.streaming_url, headers);
    if (typeof d.video_url === 'string' && d.video_url.includes('http'))
        return wrap(d.video_url, headers);
    if (typeof d.m3u8 === 'string' && d.m3u8.includes('http'))
        return wrap(d.m3u8, headers);
    const srcsPrimary = d.sources?.primary;
    if (srcsPrimary?.url)
        return wrap(srcsPrimary.url, srcsPrimary.headers ?? headers);
    if (Array.isArray(d.sources) && d.sources.length > 0) {
        const sorted = d.sources
            .filter((s) => typeof s.url === 'string' &&
            s.url.includes('http'))
            .sort((a, b) => {
            const qa = parseInt((a.quality ?? '').replace('p', '') || '0');
            const qb = parseInt((b.quality ?? '').replace('p', '') || '0');
            return qb - qa;
        });
        if (sorted.length > 0)
            return wrap(sorted[0].url, sorted[0].headers ?? headers);
    }
    if (Array.isArray(d.languages)) {
        const orig = d.languages.find((l) => l.original === true &&
            Array.isArray(l.sources) &&
            l.sources.length > 0);
        if (orig) {
            const sorted = [
                ...orig.sources
            ].sort((a, b) => parseInt((b.quality ?? '').replace('p', '') || '0') -
                parseInt((a.quality ?? '').replace('p', '') || '0'));
            return wrap(sorted[0].url ?? sorted[0].file, sorted[0].headers ??
                orig.headers ??
                headers);
        }
    }
    if (Array.isArray(d.links) && d.links.length > 0) {
        const link = d.links.find((l) => typeof l.url === 'string' && l.url.includes('http'));
        if (link)
            return wrap(link.url, headers);
    }
    const nestedData = d.data;
    if (nestedData?.data &&
        nestedData.data?.stream)
        return wrap(nestedData.data.stream?.playlist, headers);
    if (nestedData?.stream)
        return wrap(nestedData.stream?.playlist, headers);
    if (typeof nestedData?.url === 'string' && nestedData.url.includes('http'))
        return wrap(nestedData.url, nestedData.headers ?? headers);
    if (Array.isArray(nestedData?.sources)) {
        const src = nestedData.sources.find((s) => typeof s.url === 'string' && s.url.includes('http'));
        if (src)
            return wrap(src.url, src.headers ?? headers);
    }
    if (Array.isArray(d.streams)) {
        const src = d.streams.find((s) => (typeof s.url === 'string' &&
            s.url.includes('http')) ||
            (typeof s.link === 'string' &&
                s.link.includes('http')));
        if (src)
            return wrap(src.url ?? src.link, src.headers ?? headers);
    }
    return null;
}
//# sourceMappingURL=tulnex.mapper.js.map