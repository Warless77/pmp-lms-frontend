# PMP LMS

Premium PMP exam preparation LMS frontend.

## Production environment

Configure these Vercel environment variables for the Production environment:

- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_PUBLISHABLE_KEY` — Supabase publishable/anon client key

Never expose a Supabase service-role key in the frontend.

## Build

```bash
npm install
npm run build
```
