# DSA in Java — From Beginner to Advanced

A 152-day, day-by-day Data Structures & Algorithms course in Java, built as an installable PWA.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Lucide icons · Monaco Editor · Recharts · IndexedDB.

## Run it

```bash
npm install
npm run dev                 # http://localhost:3000 (service worker is off in dev)
npm run build && npm start  # production build with offline support
```

Deploy to any Node host (Vercel works out of the box). A server is required for `/api/run`.

## Java execution (Practice Arena)

Code runs server-side through a Judge0-compatible API. Credentials never reach the browser.

| Variable | Default | Purpose |
|---|---|---|
| `JUDGE0_URL` | `https://ce.judge0.com` | Execution service (free public instance, rate-limited) |
| `JUDGE0_API_KEY` | — | Key for a private or RapidAPI instance |
| `JUDGE0_AUTH_HEADER` | `X-Auth-Token` | Header for the key (`X-RapidAPI-Key` for RapidAPI) |
| `JUDGE0_JAVA_ID` | `91` | Language id (Java JDK 17) |

For regular use, point `JUDGE0_URL` at your own Judge0 instance or a RapidAPI plan.

## Sign-in and security

The whole app sits behind a login page (`/login`). Every page and API needs a signed-in session, except `/login`, `/forgot` and `/reset`.

- **Account:** `ADMIN_EMAIL` (or `ACCOUNT_EMAIL`) plus a scrypt password hash (`ADMIN_PASSWORD_HASH`) in `.env.local`. The plain password is never stored. To set a new one, run `node scripts/hash-password.mjs "NewPassword"`, or change it on the **Profile** page.
- **Access token:** signed with HMAC-SHA256 and valid for 15 minutes, in an HttpOnly cookie. Middleware checks it on every request, along with the password version and that the session still exists.
- **Refresh token:** a random token in an HttpOnly cookie sent only to `/api/auth`. It lasts 30 days with "Keep me signed in", otherwise until the browser closes. Each use replaces it. Reusing an old token signs that device out, because it may have been stolen. Only SHA-256 hashes are stored, in `.data/account.json`.
- **Renewal:** the app renews the access token in the background every 12 minutes, and page loads renew it silently through `/api/auth/refresh`.
- **Profile page:** shows your email, changes your password (which signs out every other device), lists signed-in devices so you can sign them out, and has a sign-out button.
- **Request limits** (in memory, per server process):
  - Every page and API: 60 requests per 10 seconds and 300 per minute for each IP, plus a site-wide ceiling of `GLOBAL_RPM` (default 3000 per minute).
  - Login: 5 failed attempts per 15 minutes for each IP, and 10 per hour for the account from any IP.
  - Refresh: 30 per minute. Password reset emails: 3 per hour. Java runs: 20 per minute.
- **IP detection:** limits use the last `x-forwarded-for` entry, which your proxy adds. Run behind Nginx or Cloudflare in production and set `TRUST_PROXY=1` if the proxy puts the client first. Without a proxy, a client can fake its IP, so only the account-wide and site-wide limits hold. Real denial-of-service protection needs a network layer such as Cloudflare in front of the server.
- **Other protections:** cross-site requests are blocked by an Origin check and SameSite cookies, redirects can't leave the site, and security headers are set on every response.
- **Forgot password:** emails a one-time reset link valid for 15 minutes. It needs `SMTP_*` settings in `.env.local`. A reset signs out every device.

## Study timer

The **Study Time** card on the dashboard has three buttons. **Start** begins timing and **Stop** pauses it; press Start again to resume. **End day** adds the session to your study log. The timer keeps running across pages and reloads, and a small timer in the top bar shows it.

## Catch-up lock, custom topics and split days

- **Catch-up lock:** if more than 2 scheduled days are missed, every lesson after the first unfinished day is locked until you catch up. The dashboard shows a banner, and locked lessons show a lock screen.
- **Your own topics:** on **Roadmap → Add your own topic**, pick an existing phase or create a new one, then give the topic a title, a number of days and its concepts. Any topic, built-in or yours, can also get extra concepts with **Add concept**.
- **Split a day:** on a lesson, **Split this day** spreads its concepts and problems over 2 or 3 days. **Merge back** undoes it.
- Every day has a stable key such as `topicId#part` or `topicId#part.sub`. When the plan changes, completed days, ticked tasks, revisions, lesson notes and bookmarks move with their days (see `src/lib/planRemap.ts`).

## Holidays, sick leave and target date (Settings → Study schedule)

- **Weekly holidays:** pick any 0–2 weekdays off, which gives 7, 6 or 5 study days a week.
- **Sick leave:** 2 days in every 2-week block. Take it today, from the dashboard or Settings, or on a chosen date. A leave day isn't counted as missed, and the lessons after it move one study day later.
- **Auto leave:** when turned on, leave you didn't use in a 2-week block becomes rest days at the end of that block, and the target date includes them.
- **Target finish:** the admin's target days win if set. Otherwise you can set your own date. Settings and the dashboard show whether you're on track.

## What's inside

| Section | Route |
|---|---|
| Dashboard: stats, 152-day journey, today's plan & topic, calendar, streak | `/` |
| Roadmap by phase | `/roadmap` |
| All lessons, and each lesson with 7 tabs (lesson, explanation, Java code, visualisation, problems, notes, resources) | `/lessons`, `/lessons/[day]` |
| LeetCode bank (357 problems, links checked) with filters, notes, attempt history | `/problems` |
| Java playground with exercises, tests, saved solutions | `/practice` |
| Analytics, weak topics, spaced-repetition revision planner | `/progress` |
| Bookmarks, notes, mock tests & mock interviews, settings | `/bookmarks`, `/notes`, `/mock-tests`, `/settings` |
| Video library (96 real YouTube videos), study guides, external reading, 11 templates | `/resources` |

## Project map

| Folder | Contents |
|---|---|
| `src/data/curriculum.ts` | The syllabus: 19 phases, 78 topics, days, concepts, problems |
| `src/data/content/` | Lesson content per topic (explanation, code, steps, mistakes, complexity, revision) |
| `src/data/videos.ts`, `articles.ts`, `templates.ts`, `quizzes.ts`, `practice.ts` | Library data |
| `src/lib/store.tsx`, `db.ts` | Progress store persisted in IndexedDB |
| `src/lib/derive.ts` | Schedule maths: today, streak, missed days, finish date, revisions |
| `src/components/` | Shell, dashboard, lessons + visualisers, editor, resources |

To add a topic, add it to `curriculum.ts` and give it content in `src/data/content/`. Pages pick it up automatically.

## Data & offline

Progress, notes, bookmarks and solutions stay on the device in IndexedDB. There is no account, so nothing syncs between devices. Use **Settings → Export / Import** to move data. Lessons, notes and templates work offline after you visit them, or after **Settings → Download all**. Running Java and playing videos need a connection.
