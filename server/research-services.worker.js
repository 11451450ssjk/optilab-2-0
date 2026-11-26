/**
 * OptiLab AI proxy + encrypted project sync service.
 *
 * Deploy on Cloudflare Workers and bind a KV namespace named OPTILAB_PROJECTS.
 * Required secrets:
 *   UPSTREAM_AI_URL  e.g. https://api.openai.com/v1/chat/completions
 *   UPSTREAM_AI_KEY  provider API key
 *   PROJECT_SYNC_TOKEN random token used by project clients
 * Optional:
 *   PROXY_ACCESS_TOKEN token required by browser AI clients
 *   ALLOWED_ORIGIN    default https://11451450ssjk.github.io
 */

const corsHeaders = (request, env) => {
  const allowed = env.ALLOWED_ORIGIN || "https://11451450ssjk.github.io";
  const origin = request.headers.get("Origin") || allowed;
  return {
    "Access-Control-Allow-Origin": origin === allowed ? origin : allowed,
    "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
};

const json = (request, env, data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(request, env),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });

const bearer = (request) => {
  const value = request.headers.get("Authorization") || "";
  return value.startsWith("Bearer ") ? value.slice(7).trim() : "";
};

async function handleAi(request, env) {
  if (request.method !== "POST") return json(request, env, { message: "Method not allowed" }, 405);
  if (!env.UPSTREAM_AI_URL || !env.UPSTREAM_AI_KEY) {
    return json(request, env, { message: "AI upstream is not configured" }, 503);
  }
  if (env.PROXY_ACCESS_TOKEN && bearer(request) !== env.PROXY_ACCESS_TOKEN) {
    return json(request, env, { message: "Unauthorized" }, 401);
  }
  const response = await fetch(env.UPSTREAM_AI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.UPSTREAM_AI_KEY}`
    },
    body: await request.text()
  });
  return new Response(response.body, {
    status: response.status,
    headers: {
      ...corsHeaders(request, env),
      "Content-Type": response.headers.get("Content-Type") || "application/json",
      "Cache-Control": "no-store"
    }
  });
}

async function handleProject(request, env, room) {
  if (!env.PROJECT_SYNC_TOKEN || bearer(request) !== env.PROJECT_SYNC_TOKEN) {
    return json(request, env, { message: "Unauthorized" }, 401);
  }
  if (!env.OPTILAB_PROJECTS) {
    return json(request, env, { message: "KV binding OPTILAB_PROJECTS is missing" }, 503);
  }
  const key = `project:${room}`;
  if (request.method === "GET") {
    const stored = await env.OPTILAB_PROJECTS.get(key, "json");
    if (!stored) return json(request, env, { message: "Project not found" }, 404);
    return json(request, env, { ok: true, payload: stored.payload, updatedAt: stored.updatedAt });
  }
  if (request.method === "PUT" || request.method === "POST") {
    let payload;
    try {
      payload = await request.json();
    } catch {
      return json(request, env, { message: "Invalid JSON" }, 400);
    }
    if (!payload?.ciphertext || !payload?.salt || !payload?.iv) {
      return json(request, env, { message: "Encrypted envelope is required" }, 400);
    }
    const record = { payload, updatedAt: new Date().toISOString() };
    await env.OPTILAB_PROJECTS.put(key, JSON.stringify(record), {
      metadata: { updatedAt: record.updatedAt }
    });
    return json(request, env, { ok: true, updatedAt: record.updatedAt });
  }
  return json(request, env, { message: "Method not allowed" }, 405);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }
    const url = new URL(request.url);
    if (url.pathname === "/ai" || url.pathname === "/v1/chat/completions") {
      return handleAi(request, env);
    }
    const match = url.pathname.match(/^\/projects\/([A-Za-z0-9._-]{1,120})$/);
    if (match) return handleProject(request, env, match[1]);
    return json(request, env, { ok: true, service: "OptiLab research services" });
  }
};
