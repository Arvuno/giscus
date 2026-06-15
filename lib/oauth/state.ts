import { aesGcmEncrypt, aesGcmDecrypt, DecryptionError } from './encryption';

const DEFAULT_VALIDITY_PERIOD = 5 * 60 * 1000; // 5 minutes

interface State {
  value: string;
  expires: number;
}

export async function encodeState(
  value: string,
  password: string,
  expires = Date.now() + DEFAULT_VALIDITY_PERIOD,
) {
  const state: State = { value, expires };
  return aesGcmEncrypt(JSON.stringify(state), password);
}

export async function decodeState(encryptedState: string, password: string) {
  let state: State;
  try {
    const decrypted = await aesGcmDecrypt(encryptedState, password);
    state = JSON.parse(decrypted);
  } catch (e) {
    // `aesGcmDecrypt` throws `DecryptionError` for malformed input. `JSON.parse`
    // throws `SyntaxError` for an unparsable envelope. Both are surfaced as
    // "Invalid state value" so the OAuth flow has a single, well-defined
    // failure mode to handle.
    throw new DecryptionError('Invalid state value.', { cause: e });
  }
  if (Date.now() > state.expires) {
    throw new DecryptionError('State has expired.');
  }
  return state.value;
}
