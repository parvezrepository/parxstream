import CryptoJS from 'crypto-js';
export function decrypt(encryptedText) {
    try {
        const key = Buffer.from('Zk0wdjFlczRVXzIwMjZfU2VjdXJlS2V5X0RvTm90U2hhcmVfdjJfUHJvdGVjdGVk', 'base64').toString('utf-8');
        const decrypted = CryptoJS.AES.decrypt(encryptedText, key);
        const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
        if (!jsonString) {
            throw new Error('Decryption failed - empty result');
        }
        return JSON.parse(jsonString);
    }
    catch (error) {
        throw new Error('Failed to decrypt API response');
    }
}
//# sourceMappingURL=decrypt.js.map