"""Local web server for the page. Tells the browser never to keep a copy, so a
reload always shows the latest files (python's plain http.server lets the
browser cache them)."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = 8000
SITE_ROOT = Path(__file__).resolve().parent.parent


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    handler = partial(NoCacheHandler, directory=str(SITE_ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    print(f"Serving {SITE_ROOT} at http://localhost:{PORT}")
    server.serve_forever()
