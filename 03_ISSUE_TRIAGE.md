# Phase 03: Issue Triage — giscus/giscus

## Recent Issues (Last 30, from GitHub API)

| # | Title | Labels | Category |
|---|---|---|---|
| 1710 | API returns {"error":"fetch failed"} for all repositories | - | **Bug** |
| 1707 | QUOTA!? | - | **Feedback** |
| 1702 | 重复创建讨论 (Duplicate discussion creation) | - | **Bug** |
| 1693 | Discussion title use URL encode | - | **Feature** |
| 1688 | 显示 Name 而不是 Username (Show Name not Username) | - | **Feature** |
| 1686 | Feature: Compact/inline reactions layout option | - | **Feature** |
| 1685 | [Feature Request] I hope the `<a>` can set the target attribute | - | **Feature** |
| 1684 | Giscus script not working | - | **Bug** |
| 1668 | Giscus theme mismatch (iframe border missing) | bug, giscus, theme, ui | **Bug** |
| 1665 | The emoji button is off-center | - | **Bug** |
| 1663 | server side rendering? | - | **Feature** |
| 1662 | change sort order of comments | - | **Feature** |
| 1658 | bump mathjax into v4.0 | - | **Feature** |
| 1657 | Dynamic Theme Switching Issue with VitePress Integration | - | **Bug** |
| 1656 | Dynamic Theme Switching Issue with VitePress Integration | - | **Bug** |
| 1655 | Can you have GitHub pages in one repository and comments in another? | - | **Question** |
| 1654 | After setting the defaultCommentOrder attribute to 'newest', comments are not displayed from newest to oldest | - | **Bug** |
| 1652 | Can giscus initialize discussion when the page first viewed? | - | **Feature** |
| 1645 | Can any reaction increase vote button count? | - | **Feature** |
| 1643 | test | - | **Other** |
| 1642 | Different pages use the same github discussion | - | **Bug** |
| 1639 | Failing to register login auth token | - | **Bug** |
| 1636 | Option to embed multiple widgets with manually specified data targets url/path/etc | - | **Feature** |
| 1634 | The theme after logging in does not follow the dynamically modified | - | **Bug** |
| 1630 | hola | - | **Other** |
| 1629 | prueba | - | **Other** |
| 1625 | Quick question | - | **Question** |
| 1624 | Accessibility considerations | - | **Enhancement** |
| 1621 | Proposal: Option to disable comment input box | - | **Feature** |
| 1620 | 1111 | - | **Other** |

---

## Issue Categories

| Category | Count | Notable Issues |
|---|---|---|
| **Bug** | 12 | #1710 (API fetch failure), #1668 (theme mismatch), #1654 (sort order), #1639 (OAuth token), #1642 (mapping collision) |
| **Feature** | 11 | #1693 (URL encoding toggle), #1686 (compact reactions), #1657/1656 (theme switching), #1652 (initialize discussion) |
| **Enhancement** | 2 | #1624 (accessibility), #1688 (display name) |
| **Question** | 2 | #1655 (cross-repo), #1625 (category ID) |
| **Other** | 4 | test/noise |

---

## Issues with Clear Problem Statements (3 prioritized)

### Issue #1654 — defaultCommentOrder not working
**Problem**: Setting `defaultCommentOrder` to `newest` in giscus.json doesn't sort comments newest-first.  
**Expected**: Comments displayed newest to oldest when configured.  
**Actual**: Comments still display oldest-first despite config.  
**Source**: User reported on VitePress integration, includes screenshot.  
**Triage**: Likely a server-side config parsing issue or missing implementation of comment ordering from config.

### Issue #1693 — Discussion title URL encoding
**Problem**: giscus URL-encodes discussion titles when using `pathname` or `url` mapping, which is unfriendly for maintenance and makes titles harder to read.  
**Expected**: Plain text titles without encoding.  
**Current behavior**: Titles like `my-page%20title` instead of `my-page title`.  
**Requested**: Toggle/switch to disable URL encoding.  
**Triage**: Client-side encoding in `client.ts` line 74-78, could add `data-encoding-enabled` attribute.

### Issue #1668 — Theme mismatch (iframe border missing)
**Problem**: When browser is dark mode but site is light theme, giscus iframe loses visible UI separators/borders.  
**Root cause hypothesis**: giscus uses `data-theme` but may fall back to system preference if theme mapping is invalid (e.g., using `'fro'` which isn't registered).  
**Requested fixes**: 
1. Validate theme names before using
2. Ensure postMessage theme updates work reliably
3. Add container fallback border in host CSS guidance  
**Triage**: Documentation + validation improvement needed, possibly theme name validation in client.ts.

---

## Additional Quality Observations

1. **Duplicate issues** #1656 and #1657 are identical (VitePress theme switching)
2. **Accessibility issue** #1624 mentions:
   - `aria-current` misused (should be `aria-pressed` on toggle buttons)
   - Non-logged in reaction buttons need proper disabled state
   - Screen reader structure improvements needed
3. **OAuth issue** #1639 affects Safari users on giscus.app itself