import { getDeviceId } from "./deviceId";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const data = await res.json();

    if (!res.ok) {
      throw new ApiError(
        (data as { error?: string }).error || res.statusText,
        res.status
      );
    }

    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}

// --- API Key management ---

export async function saveApiKey(apiKey: string): Promise<void> {
  await request("/api/api-key", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId: getDeviceId(), apiKey }),
  });
}

export async function checkApiKey(): Promise<{
  exists: boolean;
  updatedAt?: string;
}> {
  const deviceId = getDeviceId();
  return request(`/api/api-key?deviceId=${encodeURIComponent(deviceId)}`);
}

export async function deleteApiKey(): Promise<void> {
  await request("/api/api-key", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId: getDeviceId() }),
  });
}

// --- Food analysis ---

export async function analyzeFood(
  description: string
): Promise<{ name: string; kcal: number; protein: number; carbs: number; fat: number }[]> {
  return request("/api/analyze-food", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId: getDeviceId(), description }),
  });
}

export async function analyzeFoodImage(
  imageBase64: string,
  mimeType: string
): Promise<{ name: string; kcal: number; protein: number; carbs: number; fat: number }[]> {
  return request("/api/analyze-food", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId: getDeviceId(), imageBase64, mimeType }),
  });
}

// --- Meal suggestions ---

export interface MealSuggestion {
  name: string;
  description: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export async function suggestMeals(remaining: {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}): Promise<MealSuggestion[]> {
  return request("/api/suggest-meals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId: getDeviceId(), remaining }),
  });
}

// --- Barcode lookup ---

export async function lookupBarcode(code: string): Promise<{
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}> {
  return request(`/api/barcode?code=${encodeURIComponent(code)}`);
}
