"""
StarCG 本機代理 + 靜態網頁伺服器
用法：
    1. 安裝 Python 3（https://www.python.org/downloads/，安裝時勾選 Add to PATH）
    2. 在這個資料夾按右鍵開 PowerShell，執行：  python proxy.py
    3. 瀏覽器開 http://localhost:8000/StarCG_PriceChecker.html
不需要任何第三方 CORS proxy。
"""
import http.server
import socketserver
import urllib.request
import urllib.parse

PORT = 8000
ALLOW_HOSTS = {"member.starcg.net"}


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/proxy?"):
            self.handle_proxy()
        else:
            super().do_GET()

    def handle_proxy(self):
        query = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(query)
        target = params.get("u", [None])[0]

        if not target:
            self.send_error(400, "missing ?u=")
            return

        host = urllib.parse.urlparse(target).hostname
        if host not in ALLOW_HOSTS:
            self.send_error(403, f"host not allowed: {host}")
            return

        try:
            req = urllib.request.Request(
                target,
                headers={
                    "User-Agent": "Mozilla/5.0",
                    "Referer": "https://member.starcg.net/",
                    "Accept": "application/json, text/plain, */*",
                    "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
                },
            )
            with urllib.request.urlopen(req, timeout=20) as resp:
                body = resp.read()
                ctype = resp.headers.get("Content-Type", "application/json")
        except Exception as e:
            self.send_error(502, f"upstream error: {e}")
            return

        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"伺服器啟動：http://localhost:{PORT}/StarCG_PriceChecker.html")
        print("按 Ctrl+C 可停止")
        httpd.serve_forever()
