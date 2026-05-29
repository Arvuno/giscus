# Phase 06: Selected 5-PR Plan — giscus/giscus

## Top 5 Selected PR Candidates

---

## PR 1: Fix defaultCommentOrder Configuration

| Field | Value |
|---|---|
| **Candidate ID** | CAND-01 |
| **Title** | Fix `defaultCommentOrder` not being applied from giscus.json |
| **Type** | Bug fix |
| **Risk** | Low |
| **Size** | Small |

### Rationale
Clear reproduction steps provided by user. The bug is in config parsing — likely in `services/giscus/discussions.ts` or a page that reads the giscus.json. Single-file change expected.

### Implementation Notes
1. Find where `defaultCommentOrder` is read from giscus.json
2. Verify it's passed to the discussion fetching query
3. Test that sorting is applied correctly when set to "newest"

---

## PR 2: Add URL Encoding Toggle for Discussion Titles

| Field | Value |
|---|---|
| **Candidate ID** | CAND-02 |
| **Title** | Add option to disable URL encoding in discussion titles |
| **Type** | Feature |
| **Risk** | Medium |
| **Size** | Medium |

### Rationale
Frequently requested improvement (#1693). Currently `client.ts` encodes URL pathnames when creating discussion titles. Need to add `data-encoding-enabled` attribute to control this behavior.

### Implementation Notes
1. In `client.ts`, add handling for `data-encoding-enabled` attribute
2. When encoding is disabled, pass raw pathname as term
3. Update type definitions if needed
4. Document new attribute in ADVANCED-USAGE.md

---

## PR 3: Fix Theme Name Validation

| Field | Value |
|---|---|
| **Candidate ID** | CAND-03 |
| **Title** | Validate theme names and fall back gracefully |
| **Type** | Bug fix |
| **Risk** | Low |
| **Size** | Small |

### Rationale
Prevents broken theme loading when invalid theme names are used (like `'fro'` which isn't registered). Currently theme names are passed directly without validation, causing the theme picker to show broken previews.

### Implementation Notes
1. Add validation in `lib/utils.ts` or `getThemeUrl` function
2. If theme name isn't in `availableThemes`, fall back to `preferred_color_scheme`
3. Log warning when invalid theme is detected
4. Update theme picker in `Configuration.tsx` to filter invalid themes

---

## PR 4: Add Accessibility Improvements (aria-pressed)

| Field | Value |
|---|---|
| **Candidate ID** | CAND-04 |
| **Title** | Improve accessibility: use aria-pressed on toggle buttons |
| **Type** | Enhancement |
| **Risk** | Low |
| **Size** | Small |

### Rationale
Addresses screen reader usability issue #1624. The `aria-current` attribute is misused on buttons that should use `aria-pressed` for toggle state.

### Implementation Notes
1. In `ReactButtons.tsx`, change `aria-current` to `aria-pressed` on reaction buttons
2. In `Comment.tsx` or relevant component, add `aria-pressed` to oldest/newest sort toggle
3. Ensure disabled reaction buttons have proper `aria-label` explaining login is required
4. Consider wrapping comment sections in `role="region"` with descriptive labels

---

## PR 5: Add Minimal Working Example to README

| Field | Value |
|---|---|
| **Candidate ID** | CAND-05 |
| **Title** | Add configuration example and troubleshooting section to README |
| **Type** | Documentation |
| **Risk** | None |
| **Size** | Small |

### Rationale
Reduces support burden by answering frequently asked questions directly in README. Issue #1625 (how to find category ID) appears repeatedly.

### Implementation Notes
1. Add a "Quick Setup" section with a complete `<script>` tag example
2. Add "Finding your Category ID" step-by-step guide
3. Add "Troubleshooting" section covering:
   - 404 errors on discussion lookup
   - OAuth login failures
   - Theme not updating
4. Keep examples minimal but functional

---

## Execution Order

| Order | PR | Reason |
|---|---|---|
| 1 | CAND-01 (defaultCommentOrder) | Simplest bug fix, validates the PR workflow |
| 2 | CAND-05 (README docs) | Documentation only, easy to review and merge |
| 3 | CAND-03 (theme validation) | Small fix, related to theming |
| 4 | CAND-04 (accessibility) | Small enhancement, clear scope |
| 5 | CAND-02 (URL encoding toggle) | Feature with moderate scope, builds on client.ts understanding |

---

## Dependencies and Conflicts

- **CAND-02** (URL encoding) depends on understanding `client.ts` mapping logic
- **CAND-03** (theme validation) may need updates to `lib/variables.ts` if new themes are added
- No conflicts between the 5 PRs — they target different files