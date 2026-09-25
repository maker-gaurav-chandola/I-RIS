# I-RIS Frontend

React + TypeScript + Vite, built strictly from the documented architecture:
one page per documented route, one service module per backend boundary
(Identity, Session Engine, Evaluation, History/Progress), and no client-side
invention of interview state transitions — every page renders whatever
`state` the backend last reported.

## Wiring into your existing workspace

Your repo already uses npm workspaces with a `frontend` and `backend`
package. Drop this folder in as the `frontend` workspace (replace or merge
with what's there):

```
your-repo/
  backend/
  frontend/   ← this folder
  package.json  (root, with "workspaces": ["backend", "frontend"])
```

Then, per your documented dev workflow:

```bash
npm install
npm run dev --workspace backend
npm run dev --workspace frontend   # in a second terminal
```

The Vite dev server proxies `/api/*` to the backend (see `vite.config.ts`,
default target `http://localhost:4000` — change `VITE_BACKEND_ORIGIN` if
your backend runs elsewhere), so the frontend never needs CORS config in
development.

## Fixed for this integration pass

- **Backend port** — dev proxy target is now `http://localhost:3000`
  (`vite.config.ts`), matching the actual I-RIS backend instead of the
  earlier `4000` placeholder.
- **Auth persistence** — `useAuth` now calls `GET /api/auth/me` once on
  app load (`authService.me()` in `src/services/auth.ts`) and
  `ProtectedRoute` waits out that check (a `"checking"` status) before
  deciding whether to redirect to `/login`. A page refresh with a valid
  session cookie now stays logged in instead of bouncing to `/login`.
- **Dashboard / interview screen layout** — reworked per the integration
  notes: the dashboard leads with a single "Start a focused interview"
  action plus Recent practice / Current progress side by side, and the
  interview screen is a structured question/response workspace (Question
  block → Your response block → centered Submit), not a chat thread. A
  placeholder `lastAnalysisSummary` field on `InterviewSession`
  (`src/types/interview.ts`) gives the follow-up state somewhere to show
  what the backend said about the previous answer — see the next section.

## Still needs the actual backend source — not guessed further

Per the integration notes: no new endpoints get invented to fill gaps: the
following need the real backend inspected and the code updated to match,
not another guess from this side.

1. **API contract types** (`src/types/*.ts`) — `AuthResponse`,
   `InterviewSession`, `EvaluationResult`, etc. are still a best-effort
   reconstruction from the architecture doc. Share the backend's actual
   route handlers/response schemas (or the repo itself) and these get
   corrected to match exactly, field by field.
2. **Progress endpoint** (`src/services/history.ts`) — `getProgress()`
   still calls a guessed `GET /api/progress`. Phase 1.9 already implements
   this on the backend; point this at the real route once known.
3. **Session state names** (`src/types/interview.ts`,
   `InterviewLifecycleState`) — the eleven states here
   (`READY` → … → `RESULTS`) come from the architecture doc, not a
   confirmed dump of the Session Engine's actual state names. If the
   backend uses different names or nesting, the frontend must adopt those,
   not the other way round.
4. **Answer analysis / follow-up payload** — `lastAnalysisSummary` on
   `InterviewSession` is a placeholder so the UI has somewhere to render
   Phase 1.5/1.6's analysis output; the real field name(s) and whether
   it's nested under something else need confirming against the backend
   response before this is more than a stub.

The cleanest way to close these out: point me at (or paste in) the actual
backend route handlers and response shapes — or the repo itself — and
these get filled in precisely instead of re-guessed.

## Structure

```
src/
  app/        router + route protection
  components/ common UI, navigation shell, feedback, interview-specific
  pages/      one file per documented route
  services/   one module per backend boundary — the ONLY files that call fetch
  hooks/      useAuth (identity context), useAsyncData (fetch-on-mount)
  types/      request/response shapes per boundary
  styles/     single global stylesheet (dark UI, Space Grotesk + Roboto)
```

Design direction: dark surface, warm amber accent, Space Grotesk for
headings and Roboto for body — matches the "private interview journal, not
social media" feel from the product notes, and your stated preference for
dark, professional SaaS dashboards.
