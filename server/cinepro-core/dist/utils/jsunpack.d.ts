export default class JsUnpacker {
    private packedJS;
    constructor(packedJS: string);
    detect(): boolean;
    unpack(): string | null;
}
