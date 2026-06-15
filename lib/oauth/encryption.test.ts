import test from 'node:test';
import assert from 'node:assert/strict';
import { aesGcmDecrypt, aesGcmEncrypt, DecryptionError } from './encryption';

// The validation in `aesGcmDecrypt` runs before any webcrypto call, so these
// tests do not require a working `webcrypto` import. They exercise the input
// shape checks that protect callers from uncaught `TypeError`s when a stored
// state value is missing, truncated, or otherwise malformed.
//
// `aesGcmDecrypt` is declared `async`, so the input-validation throws are
// surfaced as a rejected promise. The assertions below therefore use
// `assert.rejects` (with `await`) rather than `assert.throws`.

test('aesGcmDecrypt rejects with DecryptionError on empty string', async () => {
  await assert.rejects(
    () => aesGcmDecrypt('', 'password'),
    (err: unknown) => err instanceof DecryptionError && /ciphertext/i.test((err as Error).message),
  );
});

test('aesGcmDecrypt rejects with DecryptionError on short input (less than 24 chars)', async () => {
  await assert.rejects(() => aesGcmDecrypt('abcdef', 'password'), DecryptionError);
  await assert.rejects(() => aesGcmDecrypt('a'.repeat(23), 'password'), DecryptionError);
});

test('aesGcmDecrypt rejects with DecryptionError on non-string input', async () => {
  // Cast through `unknown` so the test compiles; the function should still
  // throw a typed error and never reach the `webcrypto` call.
  await assert.rejects(() => aesGcmDecrypt(null as unknown as string, 'password'), DecryptionError);
  await assert.rejects(
    () => aesGcmDecrypt(undefined as unknown as string, 'password'),
    DecryptionError,
  );
  await assert.rejects(() => aesGcmDecrypt(42 as unknown as string, 'password'), DecryptionError);
  await assert.rejects(() => aesGcmDecrypt({} as unknown as string, 'password'), DecryptionError);
});

test('aesGcmDecrypt rejects with DecryptionError on whitespace-only input', async () => {
  await assert.rejects(() => aesGcmDecrypt('   ', 'password'), DecryptionError);
});

test('aesGcmDecrypt rejects when the IV segment contains non-hex characters', async () => {
  // 24 chars long, but the second byte is 'zz' which is not valid hex.
  const bad = '00zz' + 'A'.repeat(20);
  await assert.rejects(
    () => aesGcmDecrypt(bad, 'password'),
    (err: unknown) => {
      if (!(err instanceof DecryptionError)) return false;
      return /hex|iv|invalid/i.test((err as Error).message);
    },
  );
});

test('DecryptionError is a subclass of Error and carries a stable name', () => {
  const err = new DecryptionError('boom');
  assert.ok(err instanceof Error);
  assert.ok(err instanceof DecryptionError);
  assert.equal(err.name, 'DecryptionError');
  assert.equal(err.message, 'boom');
});

test('DecryptionError.cause is forwarded to the underlying Error', () => {
  const cause = new Error('inner');
  const err = new DecryptionError('outer', { cause });
  assert.strictEqual((err as Error & { cause?: unknown }).cause, cause);
});

test('DecryptionError preserves the original message even without a cause', () => {
  const err = new DecryptionError('ciphertext is empty');
  assert.equal(err.message, 'ciphertext is empty');
  assert.equal((err as Error & { cause?: unknown }).cause, undefined);
});

test('aesGcmDecrypt rejects when the IV segment has odd-length hex', async () => {
  // 24 chars but the slice yields an odd grouping because of an embedded
  // space at position 1 ("0 0...").
  const odd = '0 0' + '0'.repeat(21);
  await assert.rejects(() => aesGcmDecrypt(odd, 'password'), DecryptionError);
});

test('exported types are reachable from the module entry', () => {
  // Smoke-test that the module exports the right shapes. Runtime-only assertion.
  assert.equal(typeof aesGcmDecrypt, 'function');
  assert.equal(typeof aesGcmEncrypt, 'function');
  assert.equal(typeof DecryptionError, 'function');
});
