// StarCG 查價器用的 CORS 代理 Worker（kerzliao 自架，非原作者的 Worker）
// 部署方式：Cloudflare Dashboard -> Workers & Pages -> 進 starcg-1 -> Edit code -> 貼上這段 -> Deploy
// 部署後的網址（結尾加上 /?u=）填進 StarCG_PriceChecker.html 的 WORKER_URL
//
// 邏輯比照原作者 worker.js：白名單限制可代理的主機、正確回覆瀏覽器的 OPTIONS 預檢請求，
// 並在轉發時帶上 UA/Referer，避免上游因為看起來像機器人請求而拒絕。

const ALLOWED_HOSTS = ['member.starcg.net', 'guide.starcg.net'];

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get('u');

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      });
    }

    if (!target) {
      return new Response('Missing "u" query parameter', { status: 400 });
    }

    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch (e) {
      return new Response('Invalid target URL', { status: 400 });
    }

    if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
      return new Response('Forbidden host', { status: 403 });
    }

    let upstream;
    try {
      upstream = await fetch(targetUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Referer: 'https://member.starcg.net/',
          Accept: 'application/json, text/plain, */*',
          'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
        },
        cf: { cacheTtl: 0 },
      });
    } catch (e) {
      return new Response('upstream error: ' + e, { status: 502 });
    }

    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  },
};
