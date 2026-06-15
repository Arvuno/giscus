import { webcrypto } from '../utils';

/**
 * Error thrown when input to {@link aesGcmDecrypt} cannot be processed
 * (wrong type, wrong length, malformed IV hex, etc.). Exposed as a distinct
 * subclass so callers can branch on it without `instanceof` checking the
 * full `Error` hierarchy.
 */
export class DecryptionError extends Error {
  override readonly name = 'DecryptionError';

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    if (options && 'cause' in options) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

const IV_HEX_LENGTH = 24; // 12 bytes × 2 hex chars

function isValidHex(s: string): boolean {
  return /^[0-9a-fA-F]+$/.test(s) && s.length % 2 === 0;
}

function parseHexBytes(hex: string, label: string): Uint8Array {
  if (!isValidHex(hex)) {
    throw new DecryptionError(`Invalid ${label}: expected an even-length hex string.`);
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    const parsed = parseInt(hex.substring(i, i + 2), 16);
    if (Number.isNaN(parsed)) {
      throw new DecryptionError(`Invalid ${label}: byte at position ${i / 2} is not hex.`);
    }
    bytes[i / 2] = parsed;
  }
  return bytes;
}

function decodeBase64ToBytes(b64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(b64, 'base64'));
  }
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

/**
 * Encrypts plaintext using AES-GCM with supplied password, for decryption with aesGcmDecrypt().
 *                                                                      (c) Chris Veness MIT Licence
 *
 * @param   {String} plaintext - Plaintext to be encrypted.
 * @param   {String} password - Password to use to encrypt plaintext.
 * @returns {Promise<String>} Encrypted ciphertext.
 *
 * @example
 *   const ciphertext = await aesGcmEncrypt('my secret text', 'pw');
 *   aesGcmEncrypt('my secret text', 'pw').then(function(ciphertext) { console.log(ciphertext); });
 */
export async function aesGcmEncrypt(plaintext: string, password: string): Promise<string> {
  const pwUtf8 = new TextEncoder().encode(password); // encode password as UTF-8
  const pwHash = await webcrypto.subtle.digest('SHA-256', pwUtf8); // hash the password

  const iv = webcrypto.getRandomValues(new Uint8Array(12)); // get 96-bit random iv

  const alg = { name: 'AES-GCM', iv: iv }; // specify algorithm to use

  const key = await webcrypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']); // generate key from pw

  const ptUint8 = new TextEncoder().encode(plaintext); // encode plaintext as UTF-8
  const ctBuffer = await webcrypto.subtle.encrypt(alg, key, ptUint8); // encrypt plaintext using key

  const ctArray = Array.from(new Uint8Array(ctBuffer)); // ciphertext as byte array
  const ctStr = ctArray.map((byte) => String.fromCharCode(byte)).join(''); // ciphertext as string
  const ctBase64 = Buffer.from(ctStr, 'binary').toString('base64'); // encode ciphertext as base64

  const ivHex = Array.from(iv)
    .map((b: number) => ('00' + b.toString(16)).slice(-2))
    .join(''); // iv as hex string

  return ivHex + ctBase64; // return iv+ciphertext
}

/**
 * Decrypts ciphertext encrypted with aesGcmEncrypt() using supplied password.
 * Throws a {@link DecryptionError} when the ciphertext is the wrong type,
 * too short, or contains a malformed IV. `aesGcmDecrypt` is the only entry
 * point that touches `webcrypto.subtle.decrypt`, so any pre-conditions can
 * be checked synchronously and surface as a typed error to the caller.
 *                                                                      (c) Chris Veness MIT Licence
 *
 * @param   {String} ciphertext - Ciphertext to be decrypted.
 * @param   {String} password - Password to use to decrypt ciphertext.
 * @returns {Promise<String>} Decrypted plaintext.
 *
 * @example
 *   const plaintext = await aesGcmDecrypt(ciphertext, 'pw');
 *   aesGcmDecrypt(ciphertext, 'pw').then(function(plaintext) { console.log(plaintext); });
 */
export async function aesGcmDecrypt(ciphertext: string, password: string): Promise<string> {
  if (typeof ciphertext !== 'string') {
    throw new DecryptionError(
      `Invalid ciphertext: expected a string, received ${ciphertext === null ? 'null' : typeof ciphertext}.`,
    );
  }
  if (ciphertext.length < IV_HEX_LENGTH) {
    throw new DecryptionError(
      `Invalid ciphertext: expected at least ${IV_HEX_LENGTH} hex characters, received ${ciphertext.length}.`,
    );
  }

  const pwUtf8 = new TextEncoder().encode(password); // encode password as UTF-8
  const pwHash = await webcrypto.subtle.digest('SHA-256', pwUtf8); // hash the password

  const ivHex = ciphertext.slice(0, IV_HEX_LENGTH);
  let iv: Uint8Array;
  try {
    iv = parseHexBytes(ivHex, 'IV');
  } catch (e) {
    if (e instanceof DecryptionError) throw e;
    throw new DecryptionError('Invalid IV: failed to parse hex bytes.', { cause: e });
  }
  const alg = { name: 'AES-GCM', iv }; // specify algorithm to use

  const key = await webcrypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']); // use pw to generate key

  const ctBytes = decodeBase64ToBytes(ciphertext.slice(IV_HEX_LENGTH));
  let plainBuffer: ArrayBuffer;
  try {
    plainBuffer = await webcrypto.subtle.decrypt(alg, key, ctBytes); // decrypt ciphertext using key
  } catch (e) {
    // AES-GCM failure (wrong key, tampered ciphertext, truncated tag, etc.).
    throw new DecryptionError('Failed to decrypt ciphertext.', { cause: e });
  }
  const plaintext = new TextDecoder().decode(plainBuffer); // decode password from UTF-8

  return plaintext; // return the plaintext
}
