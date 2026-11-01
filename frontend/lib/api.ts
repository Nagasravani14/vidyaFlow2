const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function fetchFromAPI(endpoint: string, options?: RequestInit) {
  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[VidyaFlow API] Failed to fetch ${endpoint}:`, err);
    throw err;
  }
}
