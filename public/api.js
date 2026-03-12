// ============================================================
// Campus Helper – Shared API Client
// ============================================================
// Included via <script src="api.js"> in every HTML page that
// needs to talk to the Express backend.

const API_BASE = "http://localhost:5000";
const TOKEN_KEY = "campus_helper_token";
const USER_KEY = "campus_helper_user";

// ── Token helpers ────────────────────────────────────────────
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

// ── Current user helpers ─────────────────────────────────────
function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    try {
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ── Auth guard ───────────────────────────────────────────────
// Call at the top of any page that requires a logged-in user.
function requireAuth() {
    if (!getToken()) {
        window.location.href = "login.html";
    }
}

// ── Core fetch wrapper ───────────────────────────────────────
// Automatically attaches the Bearer token and returns parsed JSON.
// Throws an Error with a human-readable message on 4xx / 5xx.
async function apiFetch(path, options = {}) {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // Parse body (even for errors, server returns JSON)
    let data;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        data = await res.json();
    } else {
        data = await res.text();
    }

    if (!res.ok) {
        const msg = (data && data.error) || `Request failed (${res.status})`;
        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
    }

    return data;
}

// ── Convenience methods ──────────────────────────────────────
const api = {
    // Auth
    async login(email, password) {
        const result = await apiFetch("/api/auth/login", {
            method: "POST",
            body: { email, password },
        });
        setToken(result.token);
        setUser(result.user);
        return result;
    },

    async register(full_name, email, password, role) {
        const result = await apiFetch("/api/auth/register", {
            method: "POST",
            body: { full_name, email, password, role },
        });
        setToken(result.token);
        setUser(result.user);
        return result;
    },

    // Help requests
    async getHelpRequests(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return apiFetch(`/api/help-requests${qs ? "?" + qs : ""}`);
    },

    async updateHelpRequest(id, data) {
        return apiFetch(`/api/help-requests/${id}`, {
            method: "PATCH",
            body: data,
        });
    },

    // Sessions
    async getSessions(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return apiFetch(`/api/sessions${qs ? "?" + qs : ""}`);
    },

    // Users
    async getMe() {
        const user = getUser();
        if (!user) return null;
        return apiFetch(`/api/users/${user.id}`);
    },

    // Analytics / stats
    async getAnalytics() {
        return apiFetch("/api/analytics");
    },
};

// Expose globals
window.API_BASE = API_BASE;
window.api = api;
window.getToken = getToken;
window.setToken = setToken;
window.clearToken = clearToken;
window.getUser = getUser;
window.setUser = setUser;
window.requireAuth = requireAuth;
window.apiFetch = apiFetch;
