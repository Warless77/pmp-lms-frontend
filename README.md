# PMP Mastery private beta

React learning platform deployed on Vercel and backed by Supabase.

## Local development

1. Copy `.env.example` to `.env.local` and set the Supabase URL and publishable key.
2. Run `npm install`.
3. Run `npm start`.

Never commit secret keys, service-role keys, database passwords, or `.env.local`.

## Validation

Run `npm run check` to create a production build in `dist/`.
