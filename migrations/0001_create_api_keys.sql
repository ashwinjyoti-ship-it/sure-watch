CREATE TABLE api_keys (
  device_id     TEXT PRIMARY KEY,
  encrypted_key TEXT NOT NULL,
  iv            TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
