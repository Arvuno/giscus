# Phase 01: Repository Map — giscus/giscus

## Overview
**Repository**: [giscus/giscus](https://github.com/giscus/giscus)  
**Description**: A comments system powered by GitHub Discussions  
**Main language**: TypeScript/React (Next.js)  
**Package manager**: yarn

---

## Key Files

| File/Dir | Purpose |
|---|---|
| `README.md` | Landing page with usage instructions (~120 lines) |
| `package.json` | Project config, dependencies, scripts |
| `client.ts` | Client-side loader script (the `<script>` users embed) |
| `ADVANCED-USAGE.md` | Advanced configuration guide (~320 lines) |
| `SELF-HOSTING.md` | Self-hosting deployment guide |
| `CONTRIBUTING.md` | Development setup and contribution guidelines |

---

## Architecture

### Client-Side (Embedded Script)
- **`client.ts`** — Loads giscus iframe, handles session/OAuth callback, postMessage communication with iframe
- Users embed via `<script src="https://giscus.app/client.js" ...>`

### Server-Side (Next.js App)
- **`pages/index.tsx`** — Main landing page at giscus.app
- **`pages/widget.tsx`** — The iframe widget that renders comments
- **`pages/api/`** — API routes for discussions, OAuth, webhook

### Core Libraries
- **`lib/`** — Core logic (config, messages, i18n, hooks, fetcher, types)
- **`components/`** — React components (Comment, CommentBox, Configuration, Reply, ReactButtons, Widget, Giscus)
- **`services/github/`** — GitHub API integrations (OAuth, discussions, reactions, markdown)
- **`services/giscus/`** — Internal giscus services (token, discussions, createDiscussion)

---

## Directory Structure

```
/root/hard-pr-1/repos/giscus/
├── client.ts                  # Client loader script
├── components/                # React components
│   ├── Comment.tsx
│   ├── CommentBox.tsx
│   ├── Configuration.tsx
│   ├── Giscus.tsx
│   ├── ReactButtons.tsx
│   ├── Reply.tsx
│   └── Widget.tsx
├── lib/                       # Core utilities & types
│   ├── adapter.ts
│   ├── config.ts              # Origin validation
│   ├── context.ts
│   ├── cors.ts
│   ├── fetcher.ts
│   ├── hooks.ts
│   ├── i18n.tsx               # Internationalization
│   ├── jwt.ts
│   ├── messages.ts           # postMessage helpers
│   ├── oauth/
│   ├── reactions.ts
│   ├── types/
│   ├── utils.ts
│   └── variables.ts          # Themes, env config
├── locales/                   # 37 language directories
├── pages/                    # Next.js pages & API routes
│   ├── api/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx             # Landing page
│   └── widget.tsx            # Comment iframe widget
├── services/
│   ├── github/               # GitHub API (OAuth, discussions, reactions)
│   └── giscus/              # Internal services
├── styles/
│   ├── base.css
│   ├── globals.css
│   └── themes/              # 22 built-in themes
└── public/                  # Static assets (themes/*.css, default.css)
```

---

## Related Repository

| Repo | Purpose |
|---|---|
| [giscus/giscus-component](https://github.com/giscus/giscus-component) | React, Vue, Svelte component library wrapping giscus |

---

## Key Configuration Points

1. **`client.ts`** reads `data-*` attributes from script tag:
   - `data-repo`, `data-repo-id`, `data-category`, `data-category-id`
   - `data-mapping` (url/pathname/title/og:title/specific/number)
   - `data-theme`, `data-input-position`, `data-lang`
   - `data-strict`, `data-reactions-enabled`, `data-emit-metadata`

2. **`giscus.json`** (repo config):
   - `origins[]` — allowed origins
   - `originsRegex[]` — regex patterns for origins
   - `defaultCommentOrder` — "oldest" | "newest"

3. **Themes** defined in `lib/variables.ts` (`availableThemes`) and CSS files in `styles/themes/`

4. **i18n** — 37 locales in `locales/`, configured via `lib/i18n.tsx` and `i18n.js`