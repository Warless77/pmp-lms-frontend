# PMP Mastery private beta

React learning platform deployed on Vercel and backed by Supabase.

## Local development

1. Copy `.env.example` to `.env.local` and set the Supabase URL and publishable key.
2. Run `npm install`.
3. Run `npm start`.

Never commit secret keys, service-role keys, database passwords, or `.env.local`.

## Validation

Run `npm run check` to create a production build in `dist/`.

## Question-bank import

The application reads approved, published questions from Supabase. Apply
`supabase/migrations/20260720_question_bank.sql` in the Supabase SQL editor,
then build review candidates from the supplied archive:

```bash
node scripts/import-pmbank.mjs --archive /path/to/PMBOOK.zip --out /tmp/pmp-question-candidates.json
```

The importer intentionally marks every record `needs_review` and unpublished.
Review the answer key and explanations before importing records into
`public.questions`, then mark approved records as published. This prevents an
unverified extraction from being used for scored PMP practice or mock exams.
