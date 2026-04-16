import { encrypt } from "../lib/crypto";
import type { Env, ApiKeyRow } from "../lib/types";

interface PutBody {
  deviceId: string;
  apiKey: string;
}

interface DeleteBody {
  deviceId: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const body = (await context.request.json()) as PutBody;

  if (!body.deviceId || !UUID_RE.test(body.deviceId)) {
    return json({ error: "Invalid device ID" }, 400);
  }
  if (!body.apiKey || !body.apiKey.startsWith("sk-ant-")) {
    return json({ error: "Invalid API key format. Must start with sk-ant-" }, 400);
  }

  const { ciphertext, iv } = await encrypt(
    body.apiKey,
    context.env.ENCRYPTION_KEY
  );

  await context.env.DB.prepare(
    `INSERT INTO api_keys (device_id, encrypted_key, iv, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(device_id) DO UPDATE SET
       encrypted_key = excluded.encrypted_key,
       iv = excluded.iv,
       updated_at = datetime('now')`
  )
    .bind(body.deviceId, ciphertext, iv)
    .run();

  return json({ success: true });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const deviceId = url.searchParams.get("deviceId");

  if (!deviceId || !UUID_RE.test(deviceId)) {
    return json({ error: "Invalid device ID" }, 400);
  }

  const row = await context.env.DB.prepare(
    "SELECT device_id, created_at, updated_at FROM api_keys WHERE device_id = ?"
  )
    .bind(deviceId)
    .first<Pick<ApiKeyRow, "device_id" | "created_at" | "updated_at">>();

  if (!row) {
    return json({ exists: false });
  }

  return json({ exists: true, updatedAt: row.updated_at });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const body = (await context.request.json()) as DeleteBody;

  if (!body.deviceId || !UUID_RE.test(body.deviceId)) {
    return json({ error: "Invalid device ID" }, 400);
  }

  await context.env.DB.prepare("DELETE FROM api_keys WHERE device_id = ?")
    .bind(body.deviceId)
    .run();

  return json({ success: true });
};
