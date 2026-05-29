# Phase 05: PR Candidates — giscus/giscus

## 8-10 PR Candidates Derived from Issues + Quality Audit

---

### Candidate 1: Fix defaultCommentOrder Configuration

| Field | Value |
|---|---|
| **ID** | CAND-01 |
| **Title** | Fix `defaultCommentOrder` not being applied from giscus.json |
| **Type** | Bug fix |
| **Linked Issue** | #1654 |
| **Source** | Issue triage |
| **Risk** | Low — config parsing change |
| **Size** | Small |
| **Mergeability** | Self-contained |
| **Selected** | Yes |

**Rationale**: Clear bug, single file likely affected, user-provided reproduction steps.

---

### Candidate 2: Add URL Encoding Toggle for Discussion Titles

| Field | Value |
|---|---|
| **ID** | CAND-02 |
| **Title** | Add option to disable URL encoding in discussion titles |
| **Type** | Feature |
| **Linked Issue** | #1693 |
| **Source** | Issue triage |
| **Risk** | Medium — changes client.ts title generation |
| **Size** | Medium |
| **Mergeability** | Backward compatible |
| **Selected** | Yes |

**Rationale**: Frequently requested, improves user experience, backward compatible via new attribute.

---

### Candidate 3: Fix Theme Name Validation

| Field | Value |
|---|---|
| **ID** | CAND-03 |
| **Title** | Validate theme names and fall back gracefully |
| **Type** | Bug fix |
| **Linked Issue** | #1668 |
| **Source** | Issue triage + quality audit |
| **Risk** | Low — add validation with fallback |
| **Size** | Small |
| **Mergeability** | Self-contained |
| **Selected** | Yes |

**Rationale**: Prevents broken theme loading, improves reliability of theme switching.

---

### Candidate 4: Add Accessibility Improvements (aria-pressed)

| Field | Value |
|---|---|
| **ID** | CAND-04 |
| **Title** | Improve accessibility: use aria-pressed on toggle buttons |
| **Type** | Enhancement |
| **Linked Issue** | #1624 |
| **Source** | Issue triage |
| **Risk** | Low — ARIA attribute change |
| **Size** | Small |
| **Mergeability** | Self-contained |
| **Selected** | Yes |

**Rationale**: Addresses screen reader usability, clear what needs changing.

---

### Candidate 5: Add Minimal Working Example to README

| Field | Value |
|---|---|
| **ID** | CAND-05 |
| **Title** | Add configuration example and troubleshooting section to README |
| **Type** | Documentation |
| **Linked Issue** | (none — quality audit finding) |
| **Source** | Quality audit |
| **Risk** | None — docs only |
| **Size** | Small |
| **Mergeability** | Self-contained |
| **Selected** | Yes |

**Rationale**: Reduces support burden, frequently asked questions answered in README.

---

### Candidate 6: Add Error Handling with User Feedback

| Field | Value |
|---|---|
| **ID** | CAND-06 |
| **Title** | Improve error messages with actionable guidance |
| **Type** | Enhancement |
| **Linked Issue** | (none — quality audit finding) |
| **Source** | Quality audit |
| **Risk** | Medium — UI changes |
| **Size** | Medium |
| **Mergeability** | Backward compatible |
| **Selected** | No |

**Rationale**: Improves UX but broader scope. Keep for later.

---

### Candidate 7: Add PostMessage Theme Switching Documentation

| Field | Value |
|---|---|
| **ID** | CAND-07 |
| **Title** | Document postMessage API for theme switching in ADVANCED-USAGE |
| **Type** | Documentation |
| **Linked Issue** | #1656, #1657 |
| **Source** | Issue triage |
| **Risk** | None — docs only |
| **Size** | Small |
| **Mergeability** | Self-contained |
| **Selected** | No |

**Rationale**: Documentation fix, easier than code change. Lower priority than code PRs.

---

### Candidate 8: Add Category ID Discovery Guide

| Field | Value |
|---|---|
| **ID** | CAND-08 |
| **Title** | Add step-by-step guide to find GitHub Discussion category ID |
| **Type** | Documentation |
| **Linked Issue** | #1625 |
| **Source** | Issue triage |
| **Risk** | None — docs only |
| **Size** | Small |
| **Mergeability** | Self-contained |
| **Selected** | No |

**Rationale**: Repeated question, answered in docs once helps many users.

---

### Candidate 9: Fix OAuth Token Storage in Safari

| Field | Value |
|---|---|
| **ID** | CAND-09 |
| **Title** | Fix OAuth redirect token storage for Safari users |
| **Type** | Bug fix |
| **Linked Issue** | #1639 |
| **Source** | Issue triage |
| **Risk** | Medium — OAuth flow change |
| **Size** | Medium |
| **Mergeability** | Complex |
| **Selected** | No |

**Rationale**: Affects Safari specifically, OAuth changes are sensitive. Need more investigation.

---

### Candidate 10: Add Discussion Initialization on Page View

| Field | Value |
|---|---|
| **ID** | CAND-10 |
| **Title** | Allow initializing discussion on page view without comments |
| **Type** | Feature |
| **Linked Issue** | #1652 |
| **Source** | Issue triage |
| **Risk** | Medium — new behavior |
| **Size** | Large |
| **Mergeability** | Requires API changes |
| **Selected** | No |

**Rationale**: New feature, requires more design work. Lower priority for initial PRs.

---

## Summary Table

| ID | Title | Type | Risk | Size | Selected |
|---|---|---|---|---|---|
| CAND-01 | Fix defaultCommentOrder config | Bug | Low | Small | **Yes** |
| CAND-02 | URL encoding toggle | Feature | Medium | Medium | **Yes** |
| CAND-03 | Theme name validation | Bug | Low | Small | **Yes** |
| CAND-04 | Accessibility aria-pressed | Enhancement | Low | Small | **Yes** |
| CAND-05 | README example + troubleshooting | Docs | None | Small | **Yes** |
| CAND-06 | User-facing error handling | Enhancement | Medium | Medium | No |
| CAND-07 | PostMessage theme docs | Docs | None | Small | No |
| CAND-08 | Category ID guide | Docs | None | Small | No |
| CAND-09 | Safari OAuth fix | Bug | Medium | Medium | No |
| CAND-10 | Discussion initialization | Feature | Medium | Large | No |