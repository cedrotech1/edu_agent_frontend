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
  schools?: Array<{ id: number; name: string; location?: string | null; isPrimary?: boolean }>;
  phone?: string | null;
  image?: string | null;
  active?: number | boolean;
}

/** Normalize API / localStorage user shapes (`names` → `name`, etc.) */
export function normalizeAuthUser(raw: any): AuthUser | null {
  if (!raw || typeof raw !== "object") return null;
  const id = Number(raw.id);
  if (!Number.isFinite(id)) return null;
  const name =
    (typeof raw.name === "string" && raw.name) ||
    (typeof raw.names === "string" && raw.names) ||
    "";
  const email = typeof raw.email === "string" ? raw.email : "";
  const role = raw.role as UserRole;
  if (!email || !role) return null;
  return {
    id,
    name,
    email,
    role,
    school:
      (typeof raw.school === "string" && raw.school) ||
      (typeof raw.institution === "string" && raw.institution) ||
      null,
    schools: Array.isArray(raw.schools) ? raw.schools : [],
    phone: typeof raw.phone === "string" ? raw.phone : null,
    image: raw.image ?? null,
    active: raw.active,
  };
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
    return normalizeAuthUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser) {
  const normalized = normalizeAuthUser(user);
  if (normalized) {
    localStorage.setItem(USER_KEY, JSON.stringify(normalized));
  }
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
  warning?: string;
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
      schoolIds: number[];
      primarySchoolId?: number;
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
          schoolIds: payload.schoolIds,
          primarySchoolId: payload.primarySchoolId,
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
    forgotPassword: (email: string) =>
      apiRequest<{ success: boolean; message?: string }>("/auth/forgot-password", {
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
      schoolId: number;
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
    create: (body: unknown) =>
      apiRequest<DataResponse>("/quizzes", { method: "POST", body }),
    update: (id: string | number, body: unknown) =>
      apiRequest<DataResponse>(`/quizzes/${id}`, { method: "PATCH", body }),
    generate: (body: {
      topic: string;
      subject: string;
      educationLevel?: string;
      subLevel?: string;
      numQuestions?: number | string;
      questionType?: string;
      description?: string;
    }) =>
      apiRequest<DataResponse>("/quizzes/generate", { method: "POST", body }),
    byCode: (code: string) =>
      apiRequest<DataResponse>(`/quizzes/by-code/${encodeURIComponent(code)}`),
    get: (id: string | number, opts?: { accessCode?: string }) => {
      const code = opts?.accessCode?.trim();
      const q = code ? `?code=${encodeURIComponent(code)}` : "";
      return apiRequest<DataResponse>(`/quizzes/${id}${q}`);
    },
    submit: (
      id: string | number,
      body: {
        answers: Record<string | number, unknown>;
        timeTakenSeconds?: number;
        accessCode?: string;
      }
    ) =>
      apiRequest<DataResponse>(`/quizzes/${id}/submissions`, {
        method: "POST",
        body,
      }),
    results: (id: string | number) =>
      apiRequest<DataResponse>(`/quizzes/${id}/results`),
    exportResults: async (id: string | number) => {
      const token = getToken();
      const res = await fetch(
        `${API_BASE}/quizzes/${id}/results/export`,
        {
          headers: {
            Accept: "text/csv",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!res.ok) {
        const text = await res.text();
        let message = "Export failed";
        try {
          message = JSON.parse(text)?.message || message;
        } catch {
          if (text) message = text;
        }
        throw new ApiError(message, res.status);
      }
      return res.blob();
    },
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
    submissionDetail: (submissionId: string | number) =>
      apiRequest<DataResponse>(`/quizzes/submissions/${submissionId}`),
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
    search: (q: string) =>
      apiRequest<DataResponse>(`/users/search?q=${encodeURIComponent(q)}`),
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
    analytics: (range?: string) => {
      const q = range ? `?range=${encodeURIComponent(range)}` : "";
      return apiRequest<DataResponse>(`/admin/analytics${q}`);
    },
    health: () => apiRequest<DataResponse>("/admin/health"),
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
    messages: {
      list: () => apiRequest<DataResponse>("/admin/messages"),
      get: (id: string | number) => apiRequest<DataResponse>(`/admin/messages/${id}`),
      flag: (id: string | number, flagged = true) =>
        apiRequest<DataResponse>(`/admin/messages/${id}/flag`, {
          method: "PATCH",
          body: { flagged },
        }),
    },
    schools: {
      list: () => apiRequest<DataResponse>("/admin/schools"),
      hub: () => apiRequest<DataResponse>("/admin/schools/hub"),
      create: (body: { name: string; location?: string }) =>
        apiRequest<DataResponse>("/admin/schools", { method: "POST", body }),
      update: (id: string | number, body: Record<string, unknown>) =>
        apiRequest<DataResponse>(`/admin/schools/${id}`, { method: "PATCH", body }),
      roster: (id: string | number) =>
        apiRequest<DataResponse>(`/admin/schools/${id}/roster`),
    },
    announcements: {
      list: () => apiRequest<DataResponse>("/admin/announcements"),
      create: (body: Record<string, unknown>) =>
        apiRequest<DataResponse>("/admin/announcements", { method: "POST", body }),
      send: (id: string | number) =>
        apiRequest<DataResponse>(`/admin/announcements/${id}/send`, { method: "POST" }),
    },
  },

  messages: {
    list: () => apiRequest<DataResponse>("/conversations"),
    get: (id: string | number) => apiRequest<DataResponse>(`/conversations/${id}`),
    send: (id: string | number, body: string) =>
      apiRequest<DataResponse>(`/conversations/${id}/messages`, {
        method: "POST",
        body: { body },
      }),
    start: (recipientId: number, body?: string) =>
      apiRequest<DataResponse>("/conversations", {
        method: "POST",
        body: { recipientId, body },
      }),
    broadcast: (classId: number, body: string) =>
      apiRequest<DataResponse>("/broadcast", {
        method: "POST",
        body: { classId, body },
      }),
  },

  progress: {
    me: () => apiRequest<DataResponse>("/progress"),
  },

  schools: {
    public: () =>
      apiRequest<DataResponse>("/schools/public", { auth: false }),
    mine: () => apiRequest<DataResponse>("/me/schools"),
    updateMine: (schoolIds: number[], primarySchoolId?: number) =>
      apiRequest<DataResponse>("/me/schools", {
        method: "PUT",
        body: { schoolIds, primarySchoolId },
      }),
  },

  announcements: {
    list: () => apiRequest<DataResponse>("/announcements"),
    create: (body: Record<string, unknown>) =>
      apiRequest<DataResponse>("/announcements", { method: "POST", body }),
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
