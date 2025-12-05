import cors from 'cors';
import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

import { loadConfig } from './config/env.js';
import { collectChatSecrets } from './utils/chatSecrets.js';

const config = loadConfig();
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: false
  })
);
app.use(express.json());

const authGuard = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('x-service-token');
  if (!token || token !== config.SERVICE_API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.get('/health', (_, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/v1/secrets', authGuard, (_req, res) => {
  const chatSecrets = collectChatSecrets();

  // Collect Gemini API keys
  const geminiKeys = [];
  for (let i = 1; i <= 25; i++) {
    const key = (config as any)[`GEMINI_API_KEY_${i}`];
    if (key) geminiKeys.push(key);
  }

  // Collect Speechify API keys
  const speechifyKeys = [];
  for (let i = 1; i <= 8; i++) {
    const key = (config as any)[`SPEECHIFY_API_KEY_${i}`];
    if (key) speechifyKeys.push(key);
  }

  // Collect SearchAPI keys
  const searchApiKeys = [];
  for (let i = 1; i <= 5; i++) {
    const key = (config as any)[`SEARCHAPI_KEY_${i}`];
    if (key) searchApiKeys.push(key);
  }

  const supabase = removeEmpty({
    url: config.SUPABASE_URL,
    serviceRoleKey: config.SUPABASE_SERVICE_ROLE_KEY,
    chatDatabases: chatSecrets.length ? chatSecrets : undefined,
    feedbacksDbServiceKey: config.FEEDBACKS_DB_SERVICE_KEY
  });

  const razorpay = removeEmpty({
    keyId: config.RAZORPAY_KEY_ID,
    keySecret: config.RAZORPAY_KEY_SECRET,
    webhookSecret: config.RAZORPAY_WEBHOOK_SECRET
  });

  const apiKeys = removeEmpty({
    gemini: geminiKeys.length ? geminiKeys : undefined,
    speechify: speechifyKeys.length ? speechifyKeys : undefined,
    searchApi: searchApiKeys.length ? searchApiKeys : undefined,
    pdfCo: config.PDF_CO_API_KEY,
    clipdrop: config.CLIPDROP_API_KEY,
    handwriting: config.HANDWRITING_API_KEY,
    stability: config.STABILITY_API_KEY
  });

  const databases = removeEmpty({
    neonDbUrl: config.NEON_DB_URL
  });

  res.json(
    removeEmpty({
      supabase,
      razorpay,
      apiKeys,
      databases,
      generatedAt: new Date().toISOString()
    })
  );
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = config.PORT;
app.listen(port, () => {
  console.log(`🔐 Secret relay listening on port ${port}`);
});

function removeEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> | undefined {
  const entries = Object.entries(obj).filter(([, value]) => {
    if (value === undefined || value === null) {
      return false;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'object') {
      return Object.keys(value as object).length > 0;
    }
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return true;
  });

  if (!entries.length) {
    return undefined;
  }

  return Object.fromEntries(entries) as Partial<T>;
}

