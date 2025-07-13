import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes default
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: 1, // Retry once for better UX
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Query key factories for better organization and invalidation
export const queryKeys = {
  // Auth queries - short cache since they change frequently
  auth: {
    status: () => ['/api/auth/status'] as const,
    parentStatus: () => ['/api/parent-auth/status'] as const,
  },
  // Content queries - longer cache since they change less frequently
  blog: {
    all: () => ['/api/blog-posts'] as const,
    detail: (id: number) => ['/api/blog-posts', id] as const,
  },
  tips: {
    all: () => ['/api/tips'] as const,
    detail: (id: number) => ['/api/tips', id] as const,
  },
  // Booking related queries - medium cache
  bookings: {
    all: () => ['/api/bookings'] as const,
    byId: (id: number) => ['/api/bookings', id] as const,
    availableTimes: (date: string, lessonType: string) => 
      ['/api/available-times', date, lessonType] as const,
  },
  // Parent and athlete data
  parent: {
    info: () => ['/api/parent/info'] as const,
    athletes: () => ['/api/parent/athletes'] as const,
  },
  // Stripe data - can be cached longer
  stripe: {
    products: () => ['/api/stripe/products'] as const,
  },
} as const;
