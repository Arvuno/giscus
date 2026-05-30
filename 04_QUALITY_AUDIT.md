# Phase 04: Quality Audit — giscus/giscus

## README.md Analysis

**Length**: ~120 lines (5,354 bytes)  
**Completeness**: Basic but missing depth

### Gaps in README.md

| Gap | Current State | Recommended |
|---|---|---|
| No configuration examples | Only mentions "follow the advanced usage guide" | Add a minimal working example snippet |
| No troubleshooting section | No mention of common issues | Add common errors (404, OAuth failures, CORS) |
| No iframe fallback guidance | No mention of `.giscus-frame` CSS | Document how to style container |
| Missing "how to find category ID" | Asked in issue #1625 repeatedly | Add step-by-step in README |
| No dark mode integration guide | Only mentions themes, not dynamic switching | Document postMessage API for theme updates |
| Server-side rendering section missing | Requested in #1663 | Add note about SSR limitations |

---

## ADVANCED-USAGE.md Analysis

**Length**: ~323 lines (10,206 bytes)  
**Completeness**: Good, but has gaps

### Gaps in ADVANCED-USAGE.md

| Gap | Current State | Recommended |
|---|---|---|
| No troubleshooting section | Only describes config, no debug guidance | Add common error scenarios |
| No postMessage error handling guide | Events described but no error handling | Add error handling code examples |
| No mention of CORS requirements | Only `origins` config, no explanation | Clarify when CORS blocks requests |
| No discussion of rate limits | GitHub API rate limiting unmentioned | Add section on rate limit handling |
| No iframe sizing guidance | Mentions `resizeHeight` but not how to handle | Document responsive iframe patterns |
| Missing `data-strict` migration guide | Explains strict mode but not how to migrate old discussions | Add migration step-by-step |

---

## Error Handling Analysis

### In client.ts
```typescript
// Errors are logged to console, but messages are cryptic
console.warn(`${formatError(e?.message)} Session has been cleared.`);
console.error(`${formatError(message)} ${suggestion}`);
```

### Missing Error Handling

1. **No user-facing error UI** — Errors go to console only
2. **No network error recovery** — Failed fetches show generic "fetch failed"
3. **No loading state indication** — No visual feedback during iframe load
4. **No timeout handling** — Slow API responses show no timeout error

### Error Messages from API
- `"fetch failed"` — Generic, doesn't indicate cause (network? timeout? CORS?)
- `"Discussion not found"` — OK for new pages, but could offer creation hint
- `"API rate limit exceeded"` — Only warns, doesn't suggest backoff

---

## Configuration Examples

### Missing from README
1. No minimal working example (just a script tag placeholder)
2. No explanation of required vs optional attributes
3. No common setup scenarios (static site, Next.js, VitePress)

### Missing from ADVANCED-USAGE
1. No complete `giscus.json` example with all options
2. No example of combining `origins` and `originsRegex`
3. No example of custom theme URL usage with security notes

---

## Documentation Quality Issues

| Issue | Location | Impact |
|---|---|---|
| "Fro" theme not registered in variables.ts | Theme selection UI | Theme picker shows broken preview |
| No accessibility documentation | - | Screen reader users have poor experience |
| No i18n contribution guide in README | CONTRIBUTING.md only | Hard to discover how to add languages |
| No troubleshooting for common OAuth issues | - | Users stuck on login problems |
| Missing version migration guide | CHANGELOG only | Hard to upgrade |

---

## Accessibility Issues (from issue #1624)

1. **`aria-current` misused** — Should be `aria-pressed` on toggle buttons for correct screen reader behavior
2. **Non-logged in state** — No indication that user must be logged in to react
3. **No reaction button labeling** — Missing `aria-pressed` on reaction toggles
4. **No structural regions** — Comments should be wrapped in `role="region"` for navigation

---

## Build/Test Quality

1. **No test suite** — `package.json` has no `test` script
2. **No type-checking** — `yarn build` doesn't run `tsc --noEmit`
3. **No CI test job** — `.github/workflows/` not inspected but likely just lint/build
4. **No e2e tests** — No Playwright/Cypress tests

---

## Summary of Quality Gaps

1. **Documentation**: README needs a minimal example + troubleshooting section
2. **Error Handling**: No user-facing errors, generic "fetch failed" messages
3. **Accessibility**: Missing ARIA attributes on interactive elements
4. **Testing**: No test suite, no type-checking in CI
5. **Configuration**: Missing complete config examples in docs