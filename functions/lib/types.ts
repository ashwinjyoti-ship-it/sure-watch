export interface Env {
  DB: D1Database;
  ENCRYPTION_KEY: string;
}

export interface MacroData {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ApiKeyRow {
  device_id: string;
  encrypted_key: string;
  iv: string;
  created_at: string;
  updated_at: string;
}
