# PMP Mastery private-beta runbook

## Purpose and boundary

This is an invite-only usability and security beta. It is not a paid or public
PMP exam-preparation service. Do not enable real payments, advertise a full
question bank, or claim exam equivalence during beta.

## Before sharing a link

1. Apply both Supabase migrations listed in the README.
2. Verify Vercel Preview has only `REACT_APP_SUPABASE_URL` and
   `REACT_APP_SUPABASE_PUBLISHABLE_KEY`. A service-role key must never be in
   Vercel or browser code.
3. Run `npm ci`, `npm run check`, and `npm run smoke` from a clean checkout.
4. Open the Vercel preview in an InPrivate window:
   - `/admin` redirects to Login for an unauthenticated visitor.
   - `/dashboard` redirects to Login for an unauthenticated visitor.
   - `/mock-exam` and `/mock-exams` both load after learner sign-in.
5. Register a tester, grant their beta access from Admin, then sign in as that
   tester. Confirm Question Bank is empty before access and visible afterward.
6. Submit one practice answer and one mock-exam attempt. Sign out, sign in on a
   different browser, and confirm the attempt is shown in Dashboard/Analytics.
7. In browser developer tools, inspect the Question Bank request. It must not
   contain `correct_index` or answer explanations before a practice answer is
   submitted.

## Question review control

Only approve a question after comparing the question, answer index and
explanation with the source PDF. Start with a balanced small set from People,
Process and Business Environment; do not publish all 2,010 candidates together.
Record any correction in the source/import process before it is published.

## Feedback and incident handling

Use a short tester form or email to capture: page/link, device/browser, action,
expected result, actual result, screenshot, and whether the issue exposes an
answer or another learner's data. Remove a problematic question immediately by
setting it back to `needs_review` and `is_published = false` in Admin.

## Beta exit criteria

- At least five invited testers complete the checklist without P0/P1 defects.
- Admin can invite, revoke/expire access, and review/publish questions.
- Progress persists across sign-out and a second browser.
- No answer keys are delivered with learner question payloads.
- A reviewed, balanced bank is available; the currently published 25-question
  Business Environment set is not sufficient for a public mock exam.
- A restoration/export procedure and error-monitoring service are configured.
- A separate payment/security review is passed before any monetisation.
