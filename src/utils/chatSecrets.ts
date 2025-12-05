export interface ChatDatabaseSecret {
  id: string;
  url?: string;
  serviceRoleKey: string;
}

const CHAT_DB_PREFIX = 'CHAT_DB_';

export function collectChatSecrets(maxDatabases = 10): ChatDatabaseSecret[] {
  const secrets: ChatDatabaseSecret[] = [];

  for (let index = 1; index <= maxDatabases; index++) {
    const serviceKey =
      process.env[`${CHAT_DB_PREFIX}${index}_SERVICE_KEY`] ||
      process.env[`EXPO_PUBLIC_CHAT_DB_${index}_SERVICE_KEY`];

    const url =
      process.env[`${CHAT_DB_PREFIX}${index}_URL`] ||
      process.env[`EXPO_PUBLIC_CHAT_DB_${index}_URL`];

    if (!serviceKey && !url) {
      continue;
    }

    if (!serviceKey) {
      console.warn(
        `⚠️ CHAT_DB_${index}_URL is set but CHAT_DB_${index}_SERVICE_KEY is missing. This database will be skipped.`
      );
      continue;
    }

    secrets.push({
      id: `chat_db_${index}`,
      url: url || undefined,
      serviceRoleKey: serviceKey
    });
  }

  return secrets;
}

