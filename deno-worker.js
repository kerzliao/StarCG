// StarCG 查價器用的 CORS 代理（Deno Deploy 版）
// 跟 cloudflare-worker.js 邏輯完全一樣，差別只在部署平台 —— 用途是當 Cloudflare Worker
// 額度用完/連不上時的獨立備援，兩邊額度是分開算的，不會互相影響。
//
// 部署方式見 README 或直接照這幾步：
// 1. 打開 https://dash.deno.com，用 GitHub 帳號登入（免費，不用信用卡）
// 2. New Project -> Deploy Playground Script（不用連 GitHub repo，直接貼程式碼）
// 3. 把這個檔案的內容整個貼進去 -> Save & Deploy
// 4. 會拿到一個網址，長得像 https://你的專案名-隨機碼.deno.dev
// 5. 把網址（結尾加上 /?u=）交給我，我幫你加進 StarCG_PriceChecker.html 的 CORS_PROXIES

const ALLOWED_HOSTS = ["member.starcg.net", "guide.starcg.net"];

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const target = url.searchParams.get("u");

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  if (!target) {
    return new Response('Missing "u" query parameter', { status: 400 });
  }

  let targetUrl;
  try {
    targetUrl = new URL(target);
  } catch {
    return new Response("Invalid target URL", { status: 400 });
  }

  if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
    return new Response("Forbidden host", { status: 403 });
  }

  let upstream;
  try {
    upstream = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Referer: "https://member.starcg.net/",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
      },
    });
  } catch (e) {
    return new Response("upstream error: " + e, { status: 502 });
  }

  const body = await upstream.arrayBuffer();
  return new Response(body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") || "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
});
