const PBKDF2_ITERATIONS = 210000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

const toBase64 = (bytes) => {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
};

const fromBase64 = (b64) => {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
};

const deriveBits = async (secret, saltBytes, iterations) => {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    return new Uint8Array(
        await crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' },
            keyMaterial,
            KEY_BITS
        )
    );
};

export const hashSecret = async (secret) => {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const bits = await deriveBits(secret, salt, PBKDF2_ITERATIONS);
    return {
        hash: toBase64(bits),
        salt: toBase64(salt),
        iterations: PBKDF2_ITERATIONS
    };
};

export const verifySecret = async (secret, stored) => {
    if (!stored || !stored.hash || !stored.salt) return false;
    const iterations = stored.iterations || PBKDF2_ITERATIONS;
    const bits = await deriveBits(secret, fromBase64(stored.salt), iterations);
    const expected = fromBase64(stored.hash);
    if (bits.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < bits.length; i += 1) diff |= bits[i] ^ expected[i];
    return diff === 0;
};
