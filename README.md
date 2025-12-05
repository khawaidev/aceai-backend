# render-bck (Secret Relay)

Small Express service you can deploy to Render (or any Node host) to keep all sensitive API keys and service-role keys off the mobile client. The app requests secrets from this service at runtime using an authenticated call.

> **Never** ship service-role keys, Razorpay secrets, or third-party API keys in the Expo bundle. Only the public `EXPO_PUBLIC_*` keys should live in the app. Everything else belongs here.

## Features

- Validates environment variables with Zod on boot.
- Serves a single authenticated endpoint (`GET /v1/secrets`) that returns only the secrets you define.
- Scans `CHAT_DB_{n}_SERVICE_KEY` and `CHAT_DB_{n}_URL` for as many chat databases as you add.
- Supports multiple API keys for services like Gemini (up to 25), Speechify (up to 8), and SearchAPI (up to 5).
- Uses a simple header token (`x-service-token`) so only your mobile app (or trusted services) can read the secrets.

## Environment Variables

Copy `env.example` to a real `.env` file locally (Render will use the dashboard/CLI secrets):

### Core Configuration
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (defaults to 4000) |
| `SERVICE_API_TOKEN` | Yes | Long random string. Must match what the mobile app sends in the `x-service-token` header. |

### Supabase
| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Optional | Main Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Main Supabase service-role key |
| `CHAT_DB_{n}_URL` | Optional | URL for chat DB `n` (e.g. `CHAT_DB_1_URL`) |
| `CHAT_DB_{n}_SERVICE_KEY` | Optional | Service-role key for chat DB `n` |
| `FEEDBACKS_DB_SERVICE_KEY` | Optional | Service-role key for feedbacks database |

### Razorpay
| Variable | Required | Description |
|----------|----------|-------------|
| `RAZORPAY_KEY_ID` | Optional | Razorpay key ID (public, but convenient to return) |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay secret key (never expose in mobile app) |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Razorpay webhook secret |

### AI & ML API Keys
| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY_1` to `GEMINI_API_KEY_25` | Optional | Google Gemini API keys (add as many as you have) |
| `SPEECHIFY_API_KEY_1` to `SPEECHIFY_API_KEY_8` | Optional | Speechify TTS API keys |
| `SEARCHAPI_KEY_1` to `SEARCHAPI_KEY_5` | Optional | SearchAPI keys for web search |
| `PDF_CO_API_KEY` | Optional | PDF.co API key for PDF processing |
| `CLIPDROP_API_KEY` | Optional | Clipdrop API key for image processing |
| `HANDWRITING_API_KEY` | Optional | Handwriting recognition API key |
| `STABILITY_API_KEY` | Optional | Stability AI API key |

### Database URLs
| Variable | Required | Description |
|----------|----------|-------------|
| `NEON_DB_URL` | Optional | Neon PostgreSQL database URL |

> Only non-`EXPO_PUBLIC_` variables should live here. Render automatically keeps them server-side.

## Local Development

```bash
cd render-bck
npm install
cp env.example .env  # fill in your secrets
npm run dev          # watches src/ with nodemon
```

The health check is available at `http://localhost:4000/health`.  
Fetch secrets with:

```bash
curl -H "x-service-token: YOUR_SERVICE_API_TOKEN" http://localhost:4000/v1/secrets
```

## Deploying to Render

1. Create a new Web Service and point it to `render-bck`.
2. **Build command:** `npm install && npm run build`
3. **Start command:** `npm run start`
4. Add the environment variables described above in the Render dashboard (or via `render env:set ...`).

Render automatically injects the variables at runtime, so you do **not** need a `.env` file in the repo.

## Consuming from the Mobile App

```ts
const response = await fetch('https://<your-service>.onrender.com/v1/secrets', {
  headers: {
    'x-service-token': SERVICE_API_TOKEN_FROM_EAS_SECRETS
  }
});

if (!response.ok) throw new Error('Unable to fetch secrets');
const secrets = await response.json();
```

Store `SERVICE_API_TOKEN` as an EAS secret and read it with `process.env.EXPO_PUBLIC_SECRET_SERVICE_TOKEN` (or similar) so only authenticated builds can call the backend.

## Security Tips

- Keep the `SERVICE_API_TOKEN` long (32+ chars) and rotate regularly.
- Restrict the Render service with a custom domain + IP filtering if possible.
- Never log the actual secrets—this service only logs high-level warnings.
- If a chat DB is missing either the URL or service key, the server skips it and prints a warning so you can fix the env vars.

With this service in place, the Expo app only uses `EXPO_PUBLIC_*` keys, while the sensitive Supabase/Razorpay secrets stay on Render.

## Integration with Mobile App

After deploying the render-bck service:

1. **Set EAS Secrets** for your Expo app:
   ```bash
   eas secret:create --name EXPO_PUBLIC_SECRETS_SERVICE_URL --value https://your-service.onrender.com
   eas secret:create --name EXPO_PUBLIC_SECRET_SERVICE_TOKEN --value your-service-api-token
   ```

2. **The app's `secrets-service.ts`** will automatically fetch API keys from this backend at runtime.

3. **Services like Gemini, Speechify, etc.** will use the fetched keys with fallback to local env vars.

## Response Format

The `/v1/secrets` endpoint returns:

```json
{
  "supabase": {
    "url": "https://xxx.supabase.co",
    "serviceRoleKey": "eyJ...",
    "chatDatabases": [
      { "id": "chat_db_1", "url": "...", "serviceRoleKey": "..." }
    ],
    "feedbacksDbServiceKey": "eyJ..."
  },
  "razorpay": {
    "keyId": "rzp_live_xxx",
    "keySecret": "...",
    "webhookSecret": "..."
  },
  "apiKeys": {
    "gemini": ["key1", "key2", ...],
    "speechify": ["key1", ...],
    "searchApi": ["key1", ...],
    "pdfCo": "...",
    "clipdrop": "...",
    "handwriting": "...",
    "stability": "..."
  },
  "databases": {
    "neonDbUrl": "..."
  },
  "generatedAt": "2024-12-05T..."
}
```
