import { decrypt } from "./crypto";
import type { ApiKeyRow } from "./types";

export async function getDecryptedKey(
  db: D1Database,
  deviceId: string,
  encryptionKey: string
): Promise<string | null> {
  const row = await db
    .prepare("SELECT encrypted_key, iv FROM api_keys WHERE device_id = ?")
    .bind(deviceId)
    .first<Pick<ApiKeyRow, "encrypted_key" | "iv">>();

  if (!row) return null;

  return decrypt(row.encrypted_key, row.iv, encryptionKey);
}
