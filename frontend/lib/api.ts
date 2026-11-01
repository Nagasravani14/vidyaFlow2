const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function fetchFromAPI(endpoint: string, options?: RequestInit) {
  const url = endpoint.startsWith("http") ? endpoint : `${BACKEND_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
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
    // If external call failed and we're in the browser, fallback to relative URL
    if (typeof window !== "undefined" && !endpoint.startsWith("http")) {
      try {
        const fallbackRes = await fetch(endpoint, {
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
          ...options,
        });
        if (fallbackRes.ok) {
          return await fallbackRes.json();
        }
      } catch (_) {}
    }
    console.warn(`[VidyaFlow API] Failed to fetch ${endpoint}:`, err);
    throw err;
  }
}
