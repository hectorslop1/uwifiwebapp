type FetchJsonOptions = RequestInit & {
  errorMessage?: string;
};

type FetchErrorPayload = {
  message?: string;
  error_description?: string;
  error?: string;
};

export async function fetchJson<T>(
  input: string,
  { errorMessage, ...init }: FetchJsonOptions = {},
): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    let payload: FetchErrorPayload | null = null;

    try {
      payload = (await response.json()) as FetchErrorPayload;
    } catch {
      payload = null;
    }

    const message =
      payload?.message ||
      payload?.error_description ||
      payload?.error ||
      errorMessage ||
      "Request failed.";

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return undefined as T;
  }

  const rawBody = await response.text();

  if (!rawBody.trim()) {
    return undefined as T;
  }

  return JSON.parse(rawBody) as T;
}
