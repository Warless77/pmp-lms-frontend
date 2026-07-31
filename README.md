# PMP Mastery private beta

React learning platform deployed on Vercel and backed by Supabase.

## Local development

1. Copy `.env.example` to `.env.local` and set the Supabase URL and publishable key.
2. Run `npm install`.
3. Run `npm start`.

Never commit secret keys, service-role keys, database passwords, or `.env.local`.

## Validation

Run `npm run check` to create a production build in `dist/`.

## Private-beta launch setup

This project is intentionally an **invite-only private beta**. It does not
process payments. Do not merge the review branch into `main` or promote it to
a paid/public launch until the beta exit criteria below are complete.

1. In Supabase SQL Editor, run `supabase/migrations/20260720_question_bank.sql`
   if it has not already been applied, then run
   `supabase/migrations/20260721_private_beta_launch_foundation.sql`.
2. Confirm the owner account has `profiles.role = 'admin'` and `is_active = true`.
   Administrators get beta access automatically.
3. Open `/admin`, have a tester register, then grant their access using their
   email. Access is not granted merely by registering.
4. Set Vercel Preview environment variables only: `REACT_APP_SUPABASE_URL` and
   `REACT_APP_SUPABASE_PUBLISHABLE_KEY`. Never add a service-role key.
5. Run `npm ci`, `npm run check`, and `npm run smoke`, then complete the test
   checklist in `docs/private-beta-runbook.md` using an InPrivate browser window.

The database functions return question text/options to learners but do not
return answer keys. Practice grading and mock-exam scoring occur in Supabase,
and results are saved to the learner account.

## Question-bank import

The application reads approved, published questions from Supabase. Apply
`supabase/migrations/20260720_question_bank.sql` in the Supabase SQL editor,
then build review candidates from the supplied archive:

```bash
node scripts/import-pmbank.mjs --archive /path/to/PMBOOK.zip --out /tmp/pmp-question-candidates.csv
```

The CSV is ready for Supabase's table import. Every record is `premium`,
`needs_review`, and unpublished. Review the answer key and explanations before
marking records published. This prevents an unverified extraction from being
used for scored PMP practice or mock exams.
