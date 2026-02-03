const encoder = new TextEncoder();

const ensureCrypto = () => {
    if (!globalThis.crypto?.subtle) {
        throw new Error("Web Crypto no disponible en este entorno");
    }
    return globalThis.crypto;
};

const toBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((b) => {
        binary += String.fromCharCode(b);
    });
    return btoa(binary);
};

const fromBase64 = (value) => {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
};


export const hashPassword = async (
    password,
    { salt = null, iterations = 100000 } = {},
) => {
    const crypto = ensureCrypto();
    const saltBytes = salt ? fromBase64(salt) : crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"],
    );
    const bits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: saltBytes,
            iterations,
            hash: "SHA-256",
        },
        keyMaterial,
        256,
    );
    return {
        salt: toBase64(saltBytes),
        hash: toBase64(bits),
        iterations,
    };
};

export const verifyPassword = async (password, { salt, hash, iterations = 100000 }) => {
    if (!salt || !hash) return false;
    const computed = await hashPassword(password, { salt, iterations });
    return computed.hash === hash;
};

