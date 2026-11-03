# Vercel Deployment Fix Guide: Client Build & Dependency Resolution

This guide explains the root cause of the Vercel deployment error and provides the exact step-by-step code and configuration changes needed to resolve it.

---

## 1. Root Cause Analysis

### The Error
During Vercel's build phase (`npm install`):
```text
npm error code ERESOLVE
npm error ERESOLVE could not resolve
npm error While resolving: @tanstack/router-plugin@1.167.29
npm error Found: @tanstack/react-router@1.168.21
...
npm error Could not resolve dependency:
npm error peerOptional @tanstack/react-router@"^1.168.26" from @tanstack/router-plugin@1.167.29
npm error Conflicting peer dependency: @tanstack/react-router@1.170.46
```

### Why it Happened
1. **Conflicting Peer Dependencies:**
   - In `client/package.json`, `@tanstack/react-start@^1.167.14` pinned `@tanstack/react-router` to `1.168.21`.
   - Meanwhile, `@tanstack/router-plugin@^1.167.29` declared a peer dependency requiring `@tanstack/react-router@^1.168.26`.
   - Because `1.168.21` is lower than `1.168.26`, npm v7+ (which enforces strict peer dependencies by default) failed with `ERESOLVE`.

2. **Unused Starter Template Leftovers:**
   - The application is a standard **Vite + React SPA** (Client-Side Rendering) using `@tanstack/react-router` (`src/main.tsx` + `vite.config.ts`).
   - `@tanstack/react-start` (an SSR framework) and `@lovable.dev/vite-tanstack-config` are remnants from the initial starter template and are **not used anywhere** in the client code.
   - `@cloudflare/vite-plugin` is also unused since you are deploying on Vercel.

3. **SPA Routing Requirement (Vercel 404s):**
   - In commit `039ceb1`, `client/vercel.json` was deleted. Without a rewrite rule, refreshing any deep route (such as `/login`, `/dashboard`, or `/session`) on Vercel results in a `404 NOT_FOUND` error.

---

## 2. Summary of Changes Required

| # | File | Type | Purpose |
|---|------|------|---------|
| 1 | `client/.npmrc` | **Create File** | Tells `npm` on Vercel to install dependencies with `legacy-peer-deps=true`. |
| 2 | `client/package.json` | **Edit File** | Removes unused `@tanstack/react-start`, `@lovable.dev/vite-tanstack-config`, `@cloudflare/vite-plugin` and aligns `@tanstack/router-plugin`. |
| 3 | `client/vercel.json` | **Create File** | Enables SPA rewrites so direct navigation and browser refreshes do not 404. |
| 4 | Vercel Dashboard | **Config** | Ensure Root Directory is `client` and set `VITE_SERVER_URL`. |

---

## 3. Step-by-Step Implementation

### Step 1: Create `client/.npmrc`
Create a `.npmrc` file inside the `client/` folder with the following content:

```ini
legacy-peer-deps=true
```

> **Why:** Vercel automatically respects `.npmrc` during the `install` phase. This prevents npm from blocking the build when packages declare strict peer dependency bounds.

---

### Step 2: Clean up `client/package.json`

Open `client/package.json` and make the following changes:

#### Exact Diff for `client/package.json`:

```diff
   "dependencies": {
-    "@cloudflare/vite-plugin": "^1.25.5",
     "@hookform/resolvers": "^5.2.2",
...
     "@tanstack/react-query": "^5.83.0",
     "@tanstack/react-router": "^1.168.0",
-    "@tanstack/react-start": "^1.167.14",
-    "@tanstack/router-plugin": "^1.167.29",
+    "@tanstack/router-plugin": "^1.168.0",
     "class-variance-authority": "^0.7.1",
...
   "devDependencies": {
     "@eslint/js": "^9.32.0",
-    "@lovable.dev/vite-tanstack-config": "^1.4.0",
     "@types/node": "^22.16.5",
```

---

### Step 3: Recreate `client/vercel.json` (Fix SPA 404 on Refresh)

Create `client/vercel.json` with the following content:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

> **Why:** Single-Page Applications route entirely on the client. Without this rewrite, any URL path other than the root `/` (e.g., `/dashboard`) will trigger a Vercel 404 error on page refresh.

---

### Step 4: Configure Vercel Project Settings

In the [Vercel Dashboard](https://vercel.com):

1. Go to your Project -> **Settings** -> **General** -> **Build & Development Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client` (Click Edit, choose `client`, and click Save)
   - **Build Command**: `npm run build` (or leave default Vite)
   - **Output Directory**: `dist` (or leave default Vite)
   - **Install Command**: (Optional) Override with `npm install --legacy-peer-deps`

2. Go to **Settings** -> **Environment Variables**:
   - Add `VITE_SERVER_URL` pointing to your deployed backend (e.g. `https://your-backend.onrender.com`).
   > *Note:* If left blank or unset, client API calls fall back to `http://localhost:4000`, causing network errors in production.

---

## 4. Verification & Testing Locally

Run the following commands in your terminal before committing:

```bash
# 1. Navigate to the client directory
cd client

# 2. Test dependency installation
npm install --legacy-peer-deps

# 3. Test production build
npm run build
```

The build should output:
```text
✓ built in ...s
dist/index.html
dist/assets/index-...css
dist/assets/index-...js
```

---

## 5. Deploying to Vercel

Commit and push your changes to the branch connected to Vercel (e.g., `main` or `satyajeet`):

```bash
git add client/.npmrc client/package.json client/vercel.json VERCEL_DEPLOYMENT_FIX.md
git commit -m "fix(client): resolve Vercel npm ERESOLVE peer dependency error and restore SPA routing"
git push origin main
```

Vercel will trigger a new deployment and complete the build successfully.
