# Phase 02: Setup and Baseline — giscus/giscus

## Node Version & Setup

```bash
node --version    # Check Node.js version
yarn --version    # Check yarn version
```

**Requirements** (from package.json):
- Node.js (implied by Next.js 12.3.4 and TypeScript 5.x)
- yarn (package manager)

---

## Installation

```bash
cd /root/hard-pr-1/repos/giscus
yarn install
```

Dependencies include:
- Next.js 12.3.4
- React (via preact compat)
- TypeScript 5.x
- SWR for data fetching
- lit-html for templating

---

## Available Scripts

| Script | Purpose |
|---|---|
| `yarn dev` | Compile client script + themes, run Next.js dev server |
| `yarn build` | Full production build (cscript + cthemes + mscript + next build) |
| `yarn start` | Serve production build |
| `yarn lint` | Run stylelint + eslint |
| `yarn lint:fix` | Auto-fix lint issues |
| `yarn format` | Check prettier formatting |
| `yarn format:fix` | Auto-format with prettier |

---

## Build Pipeline

```
client.ts ──(tsc)──> public/client.js
styles/themes/*.css ──(postcss + cssnano)──> public/themes/*.css
public/client.js ──(google-closure-compiler)──> public/client.js (minified)
```

---

## Baseline Behavior

### Production Build (yarn build)
Expected to compile:
1. `client.ts` → `public/client.js` (bundled JS)
2. Theme CSS files → `public/themes/` (processed CSS)
3. Next.js pages → `.next/` (static/exported)

### Dev Server (yarn dev)
- Runs TypeScript compiler in watch mode for client.ts
- Runs PostCSS in watch mode for themes
- Starts Next.js dev server on port 3000

### Key Observations

1. **No test suite** — No `test` script in package.json
2. **No type-checking script** — `yarn build` doesn't run `tsc --noEmit`
3. **Client.js compilation** is separate from Next.js build pipeline
4. **Themes are pre-processed** into `public/themes/` via PostCSS

---

## Local Development Notes

1. Requires GitHub App credentials for full functionality
2. GraphQL API requires authentication
3. Demo repo (`giscus/giscus`) used for testing on landing page
4. Environment variables needed (see `.env.example`)