# AAC Sinhala tester portal

Closed-testing onboarding website for **AAC Sinhala**.

- App: AAC Sinhala
- Package: `lk.aac.sinhala_tamil_english`
- Google Group: `aac-sinhala-testers@googlegroups.com`
- Intended domain: `https://aac.yasaboy.com/`

This project is **not** the Android app. It is only the tester access portal: a visitor enters the Google account used on their Android device, the server records the request, membership is checked with Google, and — when Google confirms the person is a tester — the site shows the Play closed-testing join link.

It never downloads an APK or AAB. Installation happens only on Google Play.

## 1. Purpose

Give families, teachers, and practitioners a calm, accessible way to:

1. Request closed-test access
2. Learn what AAC Sinhala is
3. Open the Google Play testing link once they are eligible
4. Send private feedback

The Google Play Console feedback URL should point to `https://aac.yasaboy.com/feedback`.

## 2. Architecture

```
Browser (React + Vite + Tailwind)
        |
        |  POST /api/testers/request  (email only)
        v
Cloudflare Worker + D1
        |
        |  server-side POST (shared secret in JSON body)
        v
Google Apps Script web app
        |
        |  GroupsApp.getGroupByEmail / hasUser / getRole
        |  optional AdminDirectory.Members.insert (Workspace only)
        v
Google Group  aac-sinhala-testers@googlegroups.com
```

Secrets stay in Worker secrets and Apps Script script properties. Nothing in the frontend bundle can add testers, read the tester list, or call Google.

### Honest Google Groups limitation

Official Apps Script **GroupsApp is query-only**:

- [GroupsApp](https://developers.google.com/apps-script/reference/groups/groups-app)
- [Group](https://developers.google.com/apps-script/reference/groups/group)

Supported methods used here:

- `GroupsApp.getGroupByEmail("aac-sinhala-testers@googlegroups.com")`
- `group.hasUser(email)`
- `group.getRole(email)`

There is **no** GroupsApp method to add, invite, or remove members.

Member mutation exists only on **Admin SDK Directory**, which Google documents for **Google Workspace domain administrators**:

- [Admin SDK Directory in Apps Script](https://developers.google.com/apps-script/advanced/admin-sdk-directory)
- [members.insert](https://developers.google.com/workspace/admin/directory/reference/rest/v1/members/insert)

`aac-sinhala-testers@googlegroups.com` is a consumer Google Group. Admin Directory typically returns `Domain not found` / `Resource Not Found` for `@googlegroups.com` groups. This project **does not fake success** in that case. It stores the request as `requested` and asks an admin to add the person in the Google Groups UI.

This project also does **not**:

- Automate the Google Groups website
- Use cookies, passwords, or CAPTCHA bypasses
- Put Google credentials in the browser
- Claim that Play reported an app download

### Google Play API

[edits.testers](https://developers.google.com/android-publisher/api-ref/rest/v3/edits.testers) can attach **Google Groups** to a test track. It cannot manage individual email lists, and it cannot report that a person downloaded the app. This portal therefore does not call Play to add a single Gmail address or to prove installation.

## 3. Local development

Requirements: Node.js 20+.

```bash
cd aac-tester-portal
cp .dev.vars.example .dev.vars
npm install
npm run test
npm run typecheck
npm run lint
npm run build
```

Frontend:

```bash
npm run dev
```

Worker (in a second terminal). Create a local D1 database first:

```bash
npx wrangler d1 create aac-tester-portal
# put the returned database_id into wrangler.toml
npx wrangler d1 migrations apply aac-tester-portal --local
npm run dev:worker
```

The Vite dev server proxies `/api` to `http://127.0.0.1:8787`.

Local admin identity is **development only**. With `ENVIRONMENT=development` in `.dev.vars`, the Worker accepts `X-Admin-Dev-Email`. Production ignores that header. There is no admin password.

## 4. Google Apps Script setup

1. Open [script.google.com](https://script.google.com/) as the Google account that **owns or manages** `aac-sinhala-testers@googlegroups.com`.
2. Create a project named `AAC Sinhala tester bridge`.
3. Copy `apps-script/Code.gs` and `apps-script/appsscript.json`.
4. Project Settings → Script properties → add `SHARED_SECRET` with a long random value (32+ characters).
5. Deploy → New deployment → type **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Authorize the `groups` scope when Google prompts.
7. Copy the web app URL. Store it as the Worker secret `APPS_SCRIPT_URL`.
8. Store the same shared secret as Worker secret `APPS_SCRIPT_SHARED_SECRET`.

Apps Script web apps do not reliably receive custom HTTP headers after Google’s redirect, so the Worker sends the secret **in the JSON body**. The frontend never sees it.

Optional Workspace-only mutation:

1. Services → enable **AdminDirectory**
2. Add OAuth scope `https://www.googleapis.com/auth/admin.directory.group.member`
3. Set Worker var `ENABLE_ADMIN_DIRECTORY=true`

If Admin Directory is unavailable, the script returns `MUTATION_UNAVAILABLE`. That is expected for consumer groups.

## 5. Google authorization

The script owner authorizes **once**. Testers never sign in to Google through this website. Testers only type an email address.

Do not collect:

- Google passwords
- Play Console passwords
- OAuth refresh tokens
- Service-account JSON
- Private keys

## 6. Google Group configuration

In [Google Groups](https://groups.google.com/) for `aac-sinhala-testers@googlegroups.com`:

| Setting | Recommended |
| --- | --- |
| Who can see the group | Group members / invited people, not the public internet |
| Who can view members | Managers / owners only |
| Who can join | **Invited users only** (or “Anyone can ask”, then approve) |
| Who can post | Typically members only, or owners only if the group is just an allow-list |
| Allow external members | **On** (Play testers will be Gmail users) |
| Member list visibility | Hidden from non-managers |

Add this group to the Play closed testing track as the tester Google Group.

Pending emails appear on `/admin` so an owner can paste them into **Members → Add members** until a Workspace Directory API exists for this group.

## 7. Cloudflare D1 setup

```bash
npx wrangler login
npx wrangler d1 create aac-tester-portal
```

Put the `database_id` in `wrangler.toml`. Apply migrations:

```bash
npx wrangler d1 migrations apply aac-tester-portal --remote
```

Tables:

- `tester_requests` — email, status, timestamps, server-side error code
- `feedback` — private feedback
- `rate_limits` — hashed client windows

Never store passwords or OAuth tokens in D1.

Optional screenshots:

```bash
npx wrangler r2 bucket create aac-tester-feedback
```

Then add an `[[r2_buckets]]` binding named `FEEDBACK_BUCKET` in `wrangler.toml`. Without R2, text feedback is still saved; screenshots are skipped.

## 8. Cloudflare Worker setup

```bash
npx wrangler secret put PLAY_TEST_JOIN_URL
npx wrangler secret put APPS_SCRIPT_URL
npx wrangler secret put APPS_SCRIPT_SHARED_SECRET
npx wrangler secret put RATE_LIMIT_SALT
```

Example Play URL:

`https://play.google.com/apps/testing/lk.aac.sinhala_tamil_english`

Set vars in `wrangler.toml` or the dashboard:

```
GOOGLE_GROUP_EMAIL=aac-sinhala-testers@googlegroups.com
ENABLE_AUTO_REMOVAL=false
TESTER_INACTIVITY_DAYS=90
ALLOWED_ORIGINS=https://aac.yasaboy.com
ENVIRONMENT=production
```

The daily cron (`0 3 * * *`) re-checks membership. Auto-removal stays **off** until you set `ENABLE_AUTO_REMOVAL=true`.

## 9. Environment variables

See `.env.example` and `.dev.vars.example`. Placeholders only.

| Name | Where | Purpose |
| --- | --- | --- |
| `PLAY_TEST_JOIN_URL` | Worker secret | Closed-test join link |
| `GOOGLE_GROUP_EMAIL` | Worker var | Tester group |
| `APPS_SCRIPT_URL` | Worker secret | Apps Script web app |
| `APPS_SCRIPT_SHARED_SECRET` | Worker secret | Bridge authentication |
| `ENABLE_AUTO_REMOVAL` | Worker var | Default `false` |
| `TESTER_INACTIVITY_DAYS` | Worker var | Default `90` |
| `ALLOWED_ORIGINS` | Worker var | CSRF / CORS allow-list |
| `RATE_LIMIT_SALT` | Worker secret | Hash `CF-Connecting-IP` |
| `CF_ACCESS_TEAM_DOMAIN` | Worker var | Admin JWT issuer |
| `CF_ACCESS_AUD` | Worker var | Admin JWT audience |
| `ENABLE_ADMIN_DIRECTORY` | Worker var | Workspace mutation attempts |
| `ENVIRONMENT` | Worker var | `production` or `development` |

Do not commit `.env`, `.dev.vars`, credentials, or service-account JSON.

## 10. Cloudflare deployment

Do not deploy until install, tests, typecheck, lint, and production build succeed.

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
npx wrangler d1 migrations apply aac-tester-portal --remote
npx wrangler deploy
```

`npm run deploy` runs `build` then `wrangler deploy`.

This Worker serves the Vite `frontend/dist` assets and the `/api/*` routes from one hostname.

## 11. Custom domain setup

Do not change unrelated DNS records.

In Cloudflare Dashboard → Workers & Pages → `aac-tester-portal` → **Custom Domains** → add `aac.yasaboy.com`.

If the zone `yasaboy.com` is on Cloudflare, the dashboard can create the hostname record. If the zone is elsewhere, add only the record Cloudflare shows (usually a CNAME to the workers.dev hostname).

Then:

1. SSL/TLS: Full (strict) once the certificate is issued
2. Cloudflare Zero Trust → Access → Application:
   - Application domain: `aac.yasaboy.com/admin*` and `aac.yasaboy.com/api/admin*`
   - Policy: emails of project admins
3. Copy the Access team domain and application AUD into Worker vars `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD`

The Worker verifies `Cf-Access-Jwt-Assertion`. There is no hardcoded admin password.

## 12. Security

- Rate limits on tester requests
- Origin checks on mutating requests
- Email normalize + validate
- Duplicate emails upsert into one row
- No secrets in the frontend
- Security headers including CSP
- Hashed IPs in the rate-limit table
- Friendly tester messages; Google error codes stay in D1 `error_message` for admins
- Tester list is never public
- One tester cannot see another tester’s email
- Feedback is private

## 13. Tester flow

1. Open `https://aac.yasaboy.com/`
2. Enter the Google account used on the Android device
3. Worker validates, rate-limits, and stores `requested`
4. Apps Script checks `hasUser`
5. If already a member (or Admin Directory actually adds/invites them): show **You're ready!** and **Open Google Play**
6. If mutation is unavailable: show **Your request has been received. Please continue with Google Play.** An admin adds them in Google Groups, then they retry
7. After install, optional **I installed the app** is self-reported. It is not a Play download receipt
8. `/feedback` stores private comments

Statuses: `requested`, `invited`, `member`, `eligible`, `removed`, `error`.

`eligible` means Google Groups confirmed membership. It does **not** mean Play confirmed a download.

## 14. Troubleshooting

| Symptom | What to check |
| --- | --- |
| `invalid_email` | Typo, extra text, non-email string |
| Always pending | Consumer group cannot be mutated; add the email in Google Groups, then retry |
| `AUTH_FAILURE` in admin errors | Apps Script secret mismatch or script not authorized |
| `MUTATION_UNAVAILABLE` | Expected for `@googlegroups.com` without Workspace Admin SDK |
| 429 | Rate limit; wait 15 minutes |
| Admin 401 | Cloudflare Access not wrapping `/admin` and `/api/admin` |
| Play page says you are not a tester | Person is not in the group yet, or Play track uses a different group |
| Screenshot missing | R2 bucket not bound |

## 15. How to disable automatic removal

Keep or set:

```
ENABLE_AUTO_REMOVAL=false
```

That is the default. The cron may still refresh `last_verified_at` by calling `hasUser`. It will not attempt to remove anyone while the flag is false.

If you later enable it, also set `TESTER_INACTIVITY_DAYS`. Removal still requires a working mutation API. Website visits alone are never treated as a reason to remove a tester.

## 16. Limitations of Google Play download tracking

Google Play does not expose a reliable per-email “this person downloaded the app” signal to this portal.

[edits.testers](https://developers.google.com/android-publisher/api-ref/rest/v3/edits.testers) manages Google Groups on a track, not individual downloads.

Therefore the portal tracks **observable events only**:

- request submitted
- group membership verified
- last website activity
- optional self-reported install confirmation
- feedback submitted

Do not tell stakeholders that an email “downloaded the app” unless you have evidence from a verified official API. As of this project, that evidence is not available here.

## Manual end-to-end checklist

- [ ] Homepage renders, skip-link works, keyboard can reach Join
- [ ] Invalid email shows an accessible error
- [ ] Valid new email is stored as `requested` when Groups mutation is unavailable
- [ ] Email already in the group returns **You're ready!** and the Play URL
- [ ] Duplicate submit does not create a second row
- [ ] Fifth rapid submit is rate limited
- [ ] `/feedback` stores a message; it does not appear on the public site
- [ ] `/admin` is blocked without Access (production)
- [ ] Cron with `ENABLE_AUTO_REMOVAL=false` does not remove members
- [ ] No `.env`, JSON keys, or tokens were committed

## Project layout

```
aac-tester-portal/
  frontend/          React + Vite + Tailwind
  worker/            Cloudflare Worker + tests
  apps-script/       GroupsApp bridge
  migrations/        D1 schema
  public/            extra static copies
  shared/            email helpers used by frontend and worker
  README.md
```
