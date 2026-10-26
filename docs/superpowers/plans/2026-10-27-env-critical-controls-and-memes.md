# Critical Environment Variables & Meme UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate high-impact environment variables (`APP_DEPLOYMENT_KEY`, `HACKATHON_STATE`, `ENABLE_SUBMISSIONS`) that actively alter UI behavior, lock features, or intentionally trigger deployment failure screens if misconfigured, paired with animated hackathon meme GIFs.

**Architecture:** Extend `src/config.js` with strict environment validation and state management. Propagate state through `/health` and `/api/info`. Update `src/app.js` with route protection for submissions when disabled. Enhance frontend (`public/`) to react to `HACKATHON_STATE`, render meme GIFs (typing cat, "This is fine" dog, meltdown), and show actionable configuration error banners when `.env` is faulty.

**Tech Stack:** Node.js, Express, Tailwind CSS, Lucide icons, Node.js native test runner (`node --test`).

**Spec:** Described in conversation; impacts `src/config.js`, `src/app.js`, `public/index.html`, `public/app.js`, `public/styles.css`, `.env`, `.env.example`, `README.md`.

## Global Constraints
- Node.js 18+ native test runner for all tests.
- High-impact behavior: Missing or placeholder `APP_DEPLOYMENT_KEY` triggers a visible critical failure in health check and UI.
- `ENABLE_SUBMISSIONS=false` must return 403 Forbidden on API and disable UI submit controls.
- Memes must load reliably (reliable CDN/Giphy or embedded SVG/GIF fallback).

## Review Focus
1. `APP_DEPLOYMENT_KEY` missing or placeholder causes `/health` to return 500 status with error details.
2. `ENABLE_SUBMISSIONS=false` rejects `POST /api/projects` with HTTP 403 Forbidden.
3. `HACKATHON_STATE` accepts `RUNNING`, `PANIC_MODE`, `MAINTENANCE` and flags invalid values.
4. UI renders the appropriate meme GIF and emergency styling when in `PANIC_MODE` or `DEPLOYMENT_ERROR`.
5. Existing 23 unit tests continue to pass with backward compatibility.

---

### Task 1: Environment Validation & State Module (`src/config.js`)

**Files:**
- Modify: `src/config.js`
- Modify: `.env.example`
- Modify: `.env`
- Modify: `tests/config.test.js`

- [ ] **Step 1: Write failing tests in `tests/config.test.js`**
Test `appDeploymentKey`, `hackathonState` ('RUNNING', 'PANIC_MODE', 'MAINTENANCE'), `enableSubmissions` (boolean), and detection of `isConfigValid`.

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/config.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement config validation in `src/config.js` and update `.env` & `.env.example`**
Implement parsing, validation flags (`isConfigValid`, `configError`), and defaults.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/config.test.js`
Expected: PASS.

---

### Task 2: Backend API Protection & State Propagation (`src/app.js`)

**Files:**
- Modify: `src/app.js`
- Modify: `tests/api.test.js`

- [ ] **Step 1: Write failing API tests in `tests/api.test.js`**
Test that `/health` reflects config validity (returns 500 if deployment key missing/invalid), `/api/info` includes `hackathonState`, `enableSubmissions`, and `meme`, and `POST /api/projects` returns 403 when submissions are disabled.

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/api.test.js`
Expected: FAIL.

- [ ] **Step 3: Update `src/app.js` with state handlers and 403 gate**
Update `/health`, `/api/info`, and guard `POST /api/projects`.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/api.test.js`
Expected: PASS.

---

### Task 3: Frontend Meme GIFs & Emergency UI Modes

**Files:**
- Modify: `public/index.html`
- Modify: `public/app.js`
- Modify: `public/styles.css`
- Modify: `tests/frontend.test.js`

- [ ] **Step 1: Write failing tests in `tests/frontend.test.js`**
Verify the presence of meme container, deployment error alert container, and dynamic state classes.

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/frontend.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement Meme GIF displays and State Styling in `public/`**
Embed animated hackathon meme GIFs (speed typing cat, "This is fine" dog, server fire), red alert strobe when `PANIC_MODE`, submission lockdown badge when `enableSubmissions: false`, and critical configuration failure screen if `APP_DEPLOYMENT_KEY` is broken.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/frontend.test.js`
Expected: PASS.

---

### Task 4: Documentation & Full Suite Verification

**Files:**
- Modify: `README.md`
- Test: `tests/*.test.js`

- [ ] **Step 1: Update `README.md`**
Document `APP_DEPLOYMENT_KEY`, `HACKATHON_STATE`, `ENABLE_SUBMISSIONS`, how to intentionally break/test the deployment during AWS demos, and what each mode looks like.

- [ ] **Step 2: Run full project test suite**
Run: `npm test`
Expected: All tests PASS.
