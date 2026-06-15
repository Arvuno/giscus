import test from 'node:test';
import assert from 'node:assert/strict';
import { isEmpty, cleanAnchor, parseRepoWithOwner, normalizeRepoName } from './utils';

// `isEmpty` is a small but high-traffic helper: it powers `cleanParams`, which
// in turn shapes every request URL built by the discussion fetcher. These
// tests pin the contract so a future refactor doesn't accidentally let
// `URLSearchParams` serialize noise like `[object Object]` or `""` into the
// outgoing query string.

test('isEmpty: null and undefined are empty', () => {
  assert.equal(isEmpty(null), true);
  assert.equal(isEmpty(undefined), true);
});

test('isEmpty: empty string and NaN are empty', () => {
  assert.equal(isEmpty(''), true);
  assert.equal(isEmpty(Number.NaN), true);
});

test('isEmpty: empty arrays and empty plain objects are empty', () => {
  assert.equal(isEmpty([]), true);
  assert.equal(isEmpty({}), true);
});

test('isEmpty: non-empty arrays and objects are not empty', () => {
  assert.equal(isEmpty([1]), false);
  assert.equal(isEmpty(['a', 'b']), false);
  assert.equal(isEmpty({ a: 1 }), false);
  assert.equal(isEmpty({ a: undefined }), false); // key is present, value is irrelevant
});

test('isEmpty: falsy primitives that are not the empty sentinel are not empty', () => {
  // The caller may legitimately want to send `strict=0` or `archived=false`.
  // Filtering these would silently change request semantics.
  assert.equal(isEmpty(false), false);
  assert.equal(isEmpty(0), false);
  assert.equal(isEmpty('a'), false);
  assert.equal(isEmpty(BigInt(0)), false);
});

test('isEmpty: functions and symbols are not empty', () => {
  // Sanity check: anything that is not null/undefined/""/NaN and not a
  // collection is left alone. `URLSearchParams` will reject functions and
  // symbols on its own; we don't second-guess it.
  assert.equal(
    isEmpty(() => undefined),
    false,
  );
  assert.equal(isEmpty(Symbol('s')), false);
});

test('isEmpty: class instances are treated as empty when they have no own keys', () => {
  // `Object.keys` does not see inherited or non-enumerable properties, so a
  // bare class instance reports zero own keys. For `cleanParams` purposes
  // that is the safer answer: the instance would otherwise reach
  // `URLSearchParams` and serialize to `"[object Object]"`.
  class Bag {}
  assert.equal(isEmpty(new Bag()), true);
});

// `cleanAnchor` is exported from the same module. It trims a trailing URL
// fragment that is a section anchor (e.g. `#section`) but preserves SPA
// routing fragments (e.g. `#/path`). Locking this behavior down protects
// users from off-by-one regressions in how their origin URL is reported
// back to the giscus server.

test('cleanAnchor: trims a section anchor', () => {
  assert.equal(cleanAnchor('https://example.com/post#section'), 'https://example.com/post');
});

test('cleanAnchor: keeps an SPA routing fragment intact', () => {
  assert.equal(
    cleanAnchor('https://example.com/post#/path/to/route'),
    'https://example.com/post#/path/to/route',
  );
});

test('cleanAnchor: returns the input unchanged when there is no anchor', () => {
  assert.equal(cleanAnchor('https://example.com/post'), 'https://example.com/post');
});

test('cleanAnchor: trims only the final section-anchor segment', () => {
  // The implementation splits on every "#" not followed by "/", and then
  // trims the *last* segment (and the matching "#"). Earlier section anchors
  // are left intact so the origin URL still preserves the first anchor.
  assert.equal(
    cleanAnchor('https://example.com/post#section#sub'),
    'https://example.com/post#section',
  );
});

test('cleanAnchor: handles an empty input without throwing', () => {
  assert.doesNotThrow(() => cleanAnchor(''));
  assert.equal(cleanAnchor(''), '');
});

test('cleanAnchor: trims a trailing bare "#" with no body', () => {
  // The negative lookahead `(?!\\/)` succeeds when the character after "#" is
  // the end of the string, so a bare "#" is treated as a section anchor and
  // trimmed. Document the behavior so it doesn't drift.
  assert.equal(cleanAnchor('https://example.com/post#'), 'https://example.com/post');
});

// `parseRepoWithOwner` and `normalizeRepoName` are also exported from this
// module. They shape the `repo` query parameter sent to GitHub, so a typo
// in their handling would surface as a server error rather than a clear
// client-side validation message.

test('parseRepoWithOwner: splits owner and name', () => {
  assert.deepEqual(parseRepoWithOwner('giscus/giscus'), { owner: 'giscus', name: 'giscus' });
});

test('parseRepoWithOwner: name is undefined when input has no slash', () => {
  assert.deepEqual(parseRepoWithOwner('giscus'), { owner: 'giscus', name: undefined });
});

test('normalizeRepoName: passthrough on a bare owner/name', () => {
  assert.equal(normalizeRepoName('giscus/giscus'), 'giscus/giscus');
});

test('normalizeRepoName: extracts owner/name from a full GitHub URL', () => {
  assert.equal(normalizeRepoName('https://github.com/giscus/giscus'), 'giscus/giscus');
});

test('normalizeRepoName: doubles a bare owner into owner/owner', () => {
  // The "giscus" → "giscus/giscus" convention matches the documentation.
  assert.equal(normalizeRepoName('giscus'), 'giscus/giscus');
});

test('normalizeRepoName: returns empty string for empty input', () => {
  assert.equal(normalizeRepoName(''), '');
});
