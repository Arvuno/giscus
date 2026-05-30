# Phase 07: Initial 2-PR Plan — giscus/giscus

## First Two PRs to Open

---

## PR 1: Fix defaultCommentOrder Configuration

### Branch Name
```
fix/defaultCommentOrder-config
```

### Target Files
- `services/giscus/discussions.ts` (likely location)
- `pages/api/discussions/index.ts` (API handler)
- `lib/config.ts` (if config parsing happens here)

### Issue Link
Fixes #1654

### Implementation Notes

1. **Investigate config flow**:
   - Find where `defaultCommentOrder` is read from `giscus.json`
   - Trace how it's passed to the GraphQL discussion query
   - Identify where the sorting should be applied

2. **Common likely issue**:
   - Config is read but not forwarded to the discussion fetching function
   - Or the GraphQL query doesn't support ordering parameter

3. **Test approach**:
   - Add debug logging for config values
   - Verify the query includes `orderBy` parameter when `defaultCommentOrder` is set

4. **Sample fix pattern**:
   ```typescript
   // In discussion fetching, ensure orderBy is applied
   const discussion = await getDiscussion({
     repo,
     repoId,
     categoryId,
     term,
     strict,
     defaultCommentOrder  // <-- pass this through
   });
   ```

---

## PR 2: Add Minimal Working Example to README

### Branch Name
```
docs/readme-configuration-example
```

### Target Files
- `README.md` (add content)
- `CONTRIBUTING.md` (no change, but reference)

### Issue Link
Addresses issue #1625 (category ID question) and reduces future support burden.

### Implementation Notes

1. **Add "Quick Setup" section after line 41** (after "Advanced usage" mention):
   ```markdown
   ## Quick Setup

   1. Install the [giscus app](https://github.com/apps/giscus) on your GitHub repo
   2. Enable Discussions on your repo
   3. Go to https://giscus.app to generate your embed code:

   ```html
   <script src="https://giscus.app/client.js"
     data-repo="your-username/your-repo"
     data-repo-id="R_xxxxxxx"
     data-category="Announcements"
     data-category-id="DIC_xxxxxxx"
     data-mapping="pathname"
     data-strict="0"
     data-reactions-enabled="1"
     data-emit-metadata="0"
     data-input-position="top"
     data-theme="preferred_color_scheme"
     data-lang="en"
     crossorigin="anonymous"
     async>
   </script>
   ```

2. **Add "Finding your Category ID" section**:
   ```markdown
   ## Finding your Category ID

   1. Go to your repository's Discussions page
   2. Click on the category you want to use (e.g., "Announcements")
   3. Look at the URL: `https://github.com/owner/repo/discussions/categories/announcements`
   4. The category ID is shown in the giscus app configuration page when you select the category
   ```

3. **Add "Troubleshooting" section before "Contributing"**:
   ```markdown
   ## Troubleshooting

   ### Comments not loading (404 error)
   - Ensure Discussions is enabled on your repository
   - Verify the giscus app is installed on your repository
   - Check that the category exists and matches your config

   ### OAuth login not working
   - Ensure you're allowing giscus.app in your browser's cookie settings
   - Try clearing localStorage and logging in again

   ### Theme not updating
   - Use the postMessage API to dynamically update theme
   ```

---

## PR Workflow Notes

### For PR 1 (Bug Fix)
- Start by examining the API route `/pages/api/discussions/index.ts`
- Check how `defaultCommentOrder` from giscus.json is loaded
- Trace the GraphQL query to see if order parameter is used

### For PR 2 (Documentation)
- Keep changes focused and minimal
- Don't restructure the README, just add sections
- Ensure examples are copy-paste runnable

### Common Setup Before Starting
```bash
cd /root/hard-pr-1/repos/giscus
git upstream checkout main
git upstream pull
git checkout -b fix/defaultCommentOrder-config
```