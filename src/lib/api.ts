// export const API_BASE =
// .env
// @ts-ignore
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:9000/api/v1";
// const API_BASE = "http://127.0.0.1:9000/api/v1";

const TOKEN_KEY = "quizmind_token";
const USER_KEY = "quizmind_user";

export type UserRole = "teacher" | "student" | "admin";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  school?: string | null;
  image?: string | null;
  active?: number | boolean;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.code = code;
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(USER_KEY);
}

export function clearAuth() {
  clearToken();
  clearStoredUser();
}

export function initials(name?: string | null): string {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, auth = true, headers: customHeaders, ...rest } = options;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json: any = null;
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text };
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      clearAuth();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        const isProtected =
          window.location.pathname.startsWith("/teacher") ||
          window.location.pathname.startsWith("/student") ||
          window.location.pathname.startsWith("/admin") ||
          window.location.pathname.startsWith("/onboarding");
        if (isProtected) {
          window.location.assign("/login");
        }
      }
    }
    const message =
      json?.message || json?.error || res.statusText || "Request failed";
    throw new ApiError(message, res.status, json, json?.code);
  }

  return json as T;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
  message?: string;
}

interface DataResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        auth: false,
        body: { email, password },
      }),
    register: (payload: {
      name: string;
      email: string;
      password: string;
      institution?: string;
      school?: string;
      role: UserRole;
    }) =>
      apiRequest<{ success: boolean; message?: string }>("/auth/register", {
        method: "POST",
        auth: false,
        body: {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          institution: payload.institution ?? payload.school,
          school: payload.school ?? payload.institution,
          role: payload.role,
        },
      }),
    me: () => apiRequest<{ success: boolean; user?: AuthUser; data?: AuthUser }>("/auth/me"),
    logout: () => apiRequest<{ success: boolean }>("/auth/logout", { method: "POST" }),
    googleStub: () =>
      apiRequest<AuthResponse>("/auth/google", { method: "POST", auth: false }),
    verifyEmail: (token: string) =>
      apiRequest<{ success: boolean; message?: string; token?: string; user?: AuthUser }>(
        `/auth/verify-email?token=${encodeURIComponent(token)}`,
        { method: "GET", auth: false }
      ),
    resendVerification: (email: string) =>
      apiRequest<{ success: boolean; message?: string }>("/auth/resend-verification", {
        method: "POST",
        auth: false,
        body: { email },
      }),
  },

  classes: {
    list: () => apiRequest<DataResponse>("/classes"),
    create: (body: {
      name: string;
      subject: string;
      educationLevel: string;
      subLevel: string;
    }) => apiRequest<DataResponse>("/classes", { method: "POST", body }),
    get: (classId: string | number) =>
      apiRequest<DataResponse>(`/classes/${classId}`),
    join: (code: string) =>
      apiRequest<DataResponse>("/classes/join", { method: "POST", body: { code } }),
    invite: (classId: string | number, email: string) =>
      apiRequest<DataResponse>(`/classes/${classId}/invite`, {
        method: "POST",
        body: { email },
      }),
  },

  quizzes: {
    list: (params?: { status?: string }) => {
      const q = params?.status ? `?status=${encodeURIComponent(params.status)}` : "";
      return apiRequest<DataResponse>(`/quizzes${q}`);
    },
    get: (id: string | number) => apiRequest<DataResponse>(`/quizzes/${id}`),
    create: (body: unknown) =>
      apiRequest<DataResponse>("/quizzes", { method: "POST", body }),
    generate: (body: {
      topic: string;
      subject: string;
      educationLevel?: string;
      subLevel?: string;
      numQuestions?: number | string;
      questionType?: string;
    }) =>
      apiRequest<DataResponse>("/quizzes/generate", { method: "POST", body }),
    byCode: (code: string) =>
      apiRequest<DataResponse>(`/quizzes/by-code/${encodeURIComponent(code)}`),
    submit: (
      id: string | number,
      body: { answers: Record<string | number, unknown>; timeTakenSeconds?: number }
    ) =>
      apiRequest<DataResponse>(`/quizzes/${id}/submissions`, {
        method: "POST",
        body,
      }),
    results: (id: string | number) =>
      apiRequest<DataResponse>(`/quizzes/${id}/results`),
    flagged: (id: string | number) =>
      apiRequest<DataResponse>(`/quizzes/${id}/flagged`),
    acceptAnswer: (answerId: string | number) =>
      apiRequest<DataResponse>(`/quizzes/answers/${answerId}/accept`, {
        method: "POST",
      }),
    overrideAnswer: (answerId: string | number, manualScore: number) =>
      apiRequest<DataResponse>(`/quizzes/answers/${answerId}/override`, {
        method: "POST",
        body: { manualScore },
      }),
    studentUpcoming: () =>
      apiRequest<DataResponse>("/quizzes/student/upcoming"),
    studentCompleted: () =>
      apiRequest<DataResponse>("/quizzes/student/completed"),
    studentResults: (id: string | number) =>
      apiRequest<DataResponse>(`/quizzes/student/${id}/results`),
  },

  users: {
    list: (params?: { role?: string; search?: string; status?: string }) => {
      const sp = new URLSearchParams();
      if (params?.role && params.role !== "all") sp.set("role", params.role);
      if (params?.search) sp.set("search", params.search);
      if (params?.status) sp.set("status", params.status);
      const q = sp.toString() ? `?${sp}` : "";
      return apiRequest<DataResponse>(`/users${q}`);
    },
    create: (body: {
      name: string;
      email: string;
      role: string;
      school?: string;
    }) => apiRequest<DataResponse>("/users", { method: "POST", body }),
    update: (id: string | number, body: Record<string, unknown>) =>
      apiRequest<DataResponse>(`/users/${id}`, { method: "PATCH", body }),
    setStatus: (id: string | number, status: "active" | "suspended") =>
      apiRequest<DataResponse>(`/users/${id}/status`, {
        method: "PATCH",
        body: { status },
      }),
    deleteMe: () => apiRequest<DataResponse>("/users/me", { method: "DELETE" }),
    changePassword: (body: {
      oldPassword?: string;
      currentPassword?: string;
      newPassword: string;
      confirmPassword?: string;
    }) =>
      apiRequest<{ success: boolean; message?: string }>("/users/changePassword", {
        method: "PUT",
        body: {
          oldPassword: body.oldPassword ?? body.currentPassword,
          currentPassword: body.currentPassword ?? body.oldPassword,
          newPassword: body.newPassword,
          confirmPassword: body.confirmPassword ?? body.newPassword,
        },
      }),
  },

  notifications: {
    list: () => apiRequest<DataResponse & { unreadCount?: number }>("/notifications"),
    markRead: (id: string | number) =>
      apiRequest<DataResponse>(`/notifications/read/${id}`, { method: "PUT" }),
    markAllRead: () =>
      apiRequest<{ success: boolean; message?: string }>("/notifications/read-all", {
        method: "PUT",
      }),
    delete: (id: string | number) =>
      apiRequest<DataResponse>(`/notifications/delete/${id}`, { method: "DELETE" }),
    deleteAll: () =>
      apiRequest<{ success: boolean; message?: string }>("/notifications/delete-all", {
        method: "DELETE",
      }),
  },

  admin: {
    stats: () => apiRequest<DataResponse>("/admin/stats"),
    activity: () => apiRequest<DataResponse>("/admin/activity"),
    quizzes: () => apiRequest<DataResponse>("/admin/quizzes"),
    flagQuiz: (id: string | number, flagged: boolean) =>
      apiRequest<DataResponse>(`/admin/quizzes/${id}/flag`, {
        method: "PATCH",
        body: { flagged },
      }),
    gradingLogs: (confidence?: string) => {
      const q =
        confidence && confidence !== "all"
          ? `?confidence=${encodeURIComponent(confidence)}`
          : "";
      return apiRequest<DataResponse>(`/admin/grading-logs${q}`);
    },
    getSettings: () => apiRequest<DataResponse>("/admin/platform-settings"),
    updateSettings: (body: Record<string, unknown>) =>
      apiRequest<DataResponse>("/admin/platform-settings", {
        method: "PATCH",
        body,
      }),
    subscription: () => apiRequest<DataResponse>("/admin/subscription"),
    billing: () => apiRequest<DataResponse>("/admin/billing"),
  },

  chat: {
    public: (message: string) =>
      apiRequest<DataResponse<{ reply?: string; message?: string }>>("/chat/public", {
        method: "POST",
        auth: false,
        body: { message },
      }),

    /** Streams landing-chat tokens via SSE. Calls onDelta for each text chunk. */
    publicStream: async (
      message: string,
      onDelta: (text: string) => void,
    ): Promise<{ reply: string; model?: string }> => {
      const res = await fetch(
        `${API_BASE}/chat/public/stream`,
        {
          method: "POST",
          headers: {
            Accept: "text/event-stream",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        },
      );

      if (!res.ok) {
        let msg = "AI assistant failed to respond";
        try {
          const j = await res.json();
          msg = j?.message || msg;
        } catch {
          /* ignore */
        }
        throw new ApiError(msg, res.status);
      }

      if (!res.body) {
        throw new ApiError("No stream body from AI assistant", 502);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let reply = "";
      let model: string | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const dataLine = part
            .split("\n")
            .find((l) => l.startsWith("data:"));
          if (!dataLine) continue;
          const raw = dataLine.slice(5).trim();
          if (!raw) continue;

          let event: any;
          try {
            event = JSON.parse(raw);
          } catch {
            continue;
          }

          if (event.type === "delta" && event.text) {
            reply += event.text;
            onDelta(event.text);
          } else if (event.type === "done") {
            reply = event.reply || reply;
            model = event.model;
          } else if (event.type === "error") {
            throw new ApiError(event.message || "AI stream error", 502);
          }
        }
      }

      if (!reply.trim()) {
        throw new ApiError("AI assistant returned an empty response", 502);
      }

      return { reply, model };
    },
  },
};
