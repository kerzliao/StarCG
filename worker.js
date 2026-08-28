// StarCG 價格查詢 — Cloudflare Worker CORS 代理
// 部署方式見下方說明。免費方案每天 10 萬次請求。
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get("u");

    // CORS 預檢
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    if (!target) {
      return new Response("missing ?u=", { status: 400 });
    }

    // 白名單，避免被當開放代理濫用
    const ALLOW = ["member.starcg.net", "guide.starcg.net"];
    let host;
    try {
      host = new URL(target).hostname;
    } catch {
      return new Response("bad url", { status: 400 });
    }
    if (!ALLOW.includes(host)) {
      return new Response("host not allowed", { status: 403 });
    }

    let upstream;
    try {
      upstream = await fetch(target, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://member.starcg.net/",
          "Accept": "application/json, text/plain, */*",
          "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
        },
        cf: { cacheTtl: 0 },
      });
    } catch (e) {
      return new Response("upstream error: " + e, { status: 502 });
    }

    const body = await upstream.arrayBuffer();
    const headers = new Headers();
    headers.set("Content-Type", upstream.headers.get("Content-Type") || "application/json");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Cache-Control", "no-store");

    return new Response(body, { status: upstream.status, headers });
  },
};
