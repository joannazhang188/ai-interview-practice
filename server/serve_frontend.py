import os
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler

class SPAHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            self.path = "/index.html"
        elif self.path.startswith("/api/"):
            import http.client
            conn = http.client.HTTPConnection("localhost", 8080)
            headers = {}
            if "Content-Length" in self.headers:
                body = self.rfile.read(int(self.headers["Content-Length"]))
            else:
                body = None
            conn.request(self.command, self.path, body, dict(self.headers))
            resp = conn.getresponse()
            self.send_response(resp.status)
            for h, v in resp.getheaders():
                if h.lower() not in ("transfer-encoding",):
                    self.send_header(h, v)
            self.end_headers()
            self.wfile.write(resp.read())
            conn.close()
            return
        return SimpleHTTPRequestHandler.do_GET(self)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        SimpleHTTPRequestHandler.end_headers(self)

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

PORT = 8000
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web 端demo"))
server = HTTPServer(("0.0.0.0", PORT), SPAHandler)
print(f"SPA Server running at http://localhost:{PORT}/")
print(f"API proxy at http://localhost:{PORT}/api/")
server.serve_forever()
