export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;

  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const response = await fetch(url, {
    headers: { ...defaultHeaders, ...headers },
    ...restOptions,
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      data?.error || "An unexpected error occurred",
      response.status,
      data
    );
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, options?: Omit<FetchOptions, "method">) =>
    fetchApi<T>(endpoint, { ...options, method: "GET" }),
  
  post: <T>(endpoint: string, body: any, options?: Omit<FetchOptions, "method" | "body">) =>
    fetchApi<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
  
  put: <T>(endpoint: string, body: any, options?: Omit<FetchOptions, "method" | "body">) =>
    fetchApi<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),
  
  delete: <T>(endpoint: string, options?: Omit<FetchOptions, "method">) =>
    fetchApi<T>(endpoint, { ...options, method: "DELETE" }),
};