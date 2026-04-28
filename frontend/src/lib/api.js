const API_URL = "http://localhost:5000/api";

export const api = {
  // ── Auth ──
  register: async (username, email, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  // ── Snippets CRUD ──
  getSnippets: async (token, page = 1, limit = 20) => {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/snippets?page=${page}&limit=${limit}`, { headers });
    return res.json();
  },

  getSnippetById: async (token, id) => {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/snippets/${id}`, { headers });
    return res.json();
  },

  createSnippet: async (token, snippetData) => {
    const res = await fetch(`${API_URL}/snippets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(snippetData),
    });
    return res.json();
  },

  updateSnippet: async (token, id, snippetData) => {
    const res = await fetch(`${API_URL}/snippets/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(snippetData),
    });
    return res.json();
  },

  deleteSnippet: async (token, id) => {
    const res = await fetch(`${API_URL}/snippets/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // ── Search ──
  // Supports: q (keyword), language, tags (comma-separated), page, limit
  searchSnippets: async (query, token = null, page = 1, { language = "", tags = "" } = {}) => {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (language) params.set("language", language);
    if (tags) params.set("tags", tags);
    params.set("page", page);

    const res = await fetch(`${API_URL}/search?${params.toString()}`, { headers });
    return res.json();
  },

  // ── Comments ──
  getComments: async (snippetId) => {
    const res = await fetch(`${API_URL}/snippets/${snippetId}/comments`);
    return res.json();
  },

  addComment: async (token, snippetId, content) => {
    const res = await fetch(`${API_URL}/snippets/${snippetId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    return res.json();
  },

  deleteComment: async (token, snippetId, commentId) => {
    const res = await fetch(`${API_URL}/snippets/${snippetId}/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // ── Sharing ──
  generateShareLink: async (token, snippetId) => {
    const res = await fetch(`${API_URL}/snippets/${snippetId}/share/link`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  shareWithUser: async (token, snippetId, targetUser) => {
    const res = await fetch(`${API_URL}/snippets/${snippetId}/share/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUser }),
    });
    return res.json();
  },

  // ── AI ──
  generateSummary: async (token, snippetId) => {
    const res = await fetch(`${API_URL}/snippets/${snippetId}/summarize`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};
