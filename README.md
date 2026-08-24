# AAC Sinhala tester portal

Closed-testing onboarding website for **AAC Sinhala**.

- Website: `https://aac.yasaboy.com/`
- Package: `lk.aac.sinhala_tamil_english`
- Play track: `alpha`
- Google Group: `aac-sinhala-testers@googlegroups.com`

This is not the Android app. Testers enter a Gmail address, join the tester group themselves, then open the Google Play closed-test opt-in page and install AAC-Sinhala from Play.

## 1. Tester flow

```
Gmail
  → Join Tester Group (in-site guide)
  → Open Tester Group in a new tab
  → Tap Join group on Google Groups
  → Check My Access
  → Join Google Play Test
  → Install AAC-Sinhala
```

Configured links:

- Group: `GOOGLE_GROUP_EMAIL` / `GOOGLE_GROUP_JOIN_URL`
- Closed test: `PLAY_TEST_JOIN_URL`
- Store listing: `PLAY_STORE_URL`

The website records:

- request submitted
- group join link opened
- Play link opened
- feedback submitted

It does **not** mark someone as added to the group or Play merely because they clicked a button.

If membership cannot be verified, the UI says **Membership verification unavailable**.

Google does not document a current Groups URL that auto-joins a member. Official help is: open the group page and tap **Join group**. This portal therefore uses `https://groups.google.com/g/aac-sinhala-testers` and shows a short instruction card first.

To make Join group easier to find on Google's page (manual group settings, not changed by this site): keep **Who can join group** = Anyone on the web can join, and **Who can see group** visible enough that signed-in Gmail users can open the group.

## 2. Google Group setup

In [Google Groups](https://groups.google.com/) for `aac-sinhala-testers@googlegroups.com`:

| Setting | Recommended |
| --- | --- |
| Who can join | Anyone on the web, or “Anyone can ask” if you want approval |
| Allow external members | On |
| Who can view members | Owners / managers only |
| Who can see the group | Not public if you do not need it public |
| Member list | Hidden from non-managers |

Attach this group to the Play **closed testing / alpha** track as the tester Google Group.

The self-service button opens:

`GOOGLE_GROUP_JOIN_URL` (default `https://groups.google.com/g/aac-sinhala-testers`)

## 3. Closed Testing setup

1. Play Console → AAC Sinhala → **Closed testing** (track `alpha`)
2. Testers → Google Groups → `aac-sinhala-testers@googlegroups.com`
3. Copy the web opt-in URL (often `https://play.google.com/apps/testing/lk.aac.sinhala_tamil_english`)
4. Store it as Worker secret/var `PLAY_TEST_JOIN_URL`
5. Point Play feedback to `https://aac.yasaboy.com/feedback`

This site never hosts or downloads an APK/AAB.

## 4. How to configure `GOOGLE_GROUP_JOIN_URL`

```bash
npx wrangler secret put GOOGLE_GROUP_JOIN_URL
# or set [vars] in wrangler.toml
```

Use the official Groups page for `aac-sinhala-testers`. Example:

`https://groups.google.com/g/aac-sinhala-testers`

If unset, the Worker derives that URL from `GOOGLE_GROUP_EMAIL`.

## 5. How to configure `PLAY_TEST_JOIN_URL`

```bash
npx wrangler secret put PLAY_TEST_JOIN_URL
```

Paste the Closed testing **web opt-in** URL from Play Console, then set `PLAY_STORE_URL` to the public listing:

```
PLAY_TEST_JOIN_URL=https://play.google.com/apps/testing/lk.aac.sinhala_tamil_english
PLAY_STORE_URL=https://play.google.com/store/apps/details?id=lk.aac.sinhala_tamil_english
```

## 6. D1 setup

```bash
npx wrangler login
npx wrangler d1 create aac-tester-portal
# put database_id into wrangler.toml
npx wrangler d1 migrations apply aac-tester-portal --remote
```

Local:

```bash
npx wrangler d1 migrations apply aac-tester-portal --local
```

`tester_requests` stores onboarding events only. No passwords or OAuth tokens.

## 7. Cloudflare deployment

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
npx wrangler d1 migrations apply aac-tester-portal --remote
npx wrangler secret put PLAY_TEST_JOIN_URL
npx wrangler secret put RATE_LIMIT_SALT
npx wrangler deploy
```

Then Workers & Pages → Custom Domains → `aac.yasaboy.com`.

Protect `/admin*` and `/api/admin*` with Cloudflare Access. Set `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD`.

## 8. Admin dashboard

`/admin` (Access-protected) shows:

- total tester requests
- pending group joins
- pending Play joins
- completed onboarding flows (both links opened — **not** verified membership)
- feedback count
- recent requests
- CSV export

Verified Google Group memberships are shown separately and stay 0 unless a supported read API confirms `hasUser`.

## 9. Feedback system

Public form: `https://aac.yasaboy.com/feedback`

Fields: email, type (Bug / Suggestion / Usability / Accessibility / Other), message, optional screenshot.

Stored in D1. Not shown publicly. Screenshots need an optional R2 bucket.

## 10. Google API limitations

[GroupsApp](https://developers.google.com/apps-script/reference/groups/groups-app) is query-only (`getGroupByEmail`, `hasUser`, `getRole`).

[edits.testers](https://developers.google.com/android-publisher/api-ref/rest/v3/edits.testers) attaches Google Groups to a track. It does not add one Gmail address and does not report downloads.

## 11. Why automatic consumer Google Group membership is not implemented

`aac-sinhala-testers@googlegroups.com` is a consumer group. Adding members requires [Admin SDK Directory](https://developers.google.com/apps-script/advanced/admin-sdk-directory), which Google documents for **Workspace domain admins**. Consumer `@googlegroups.com` groups are not Directory resources.

This project does not:

- automate the Groups website
- collect Google passwords
- reuse cookies/sessions
- bypass CAPTCHAs
- call undocumented APIs

Self-service join is the supported path.

## 12. Switching to Google Workspace / Admin SDK later

If the tester group moves to a Workspace domain:

1. Enable Admin Directory in Apps Script
2. Authorize `https://www.googleapis.com/auth/admin.directory.group.member`
3. Store `APPS_SCRIPT_URL` and `APPS_SCRIPT_SHARED_SECRET` as Worker secrets
4. Keep using `GroupsApp.hasUser` for verification
5. Only then may the portal set `membership_verified` / status `completed`

Until Google confirms membership, never tell a tester they were added.

## Local development

```bash
cp .dev.vars.example .dev.vars
npm install
npm run test
npm run dev
```

Worker (second terminal):

```bash
npx wrangler d1 migrations apply aac-tester-portal --local
npm run dev:worker
```

## Automatic maintenance

Daily cron recalculates status and may mark stale rows `needs_attention`.

It does **not** remove people from the Google Group. Play download status is not available.

## Project layout

```
frontend/      React + Vite + Tailwind
worker/        Cloudflare Worker
apps-script/   optional read-only GroupsApp bridge
migrations/    D1 schema
shared/        email + status helpers
```
