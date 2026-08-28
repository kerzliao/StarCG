// StarCG 查價器用的 CORS 代理 Worker
// 部署方式：Cloudflare Dashboard -> Workers & Pages -> Create Worker -> 貼上這段 -> Deploy
// 部署後把拿到的網址（結尾加上 /?u=）填進 StarCG_PriceChecker.html 的 WORKER_URL

const ALLOWED_HOSTS = ['member.starcg.net'];

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get('u');

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

    const upstream = await fetch(targetUrl.toString(), {
      headers: { Accept: 'application/json, text/plain, */*' },
    });
    const body = await upstream.text();

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
