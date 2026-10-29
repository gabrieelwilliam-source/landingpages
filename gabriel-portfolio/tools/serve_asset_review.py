"""Serve local asset review only; originals are never exposed by this server."""
import http.server,pathlib,urllib.parse,sys
root=pathlib.Path(sys.argv[1]).resolve();vendor=pathlib.Path(__file__).resolve().parents[1]/'node_modules'
class Handler(http.server.SimpleHTTPRequestHandler):
 def translate_path(self,path):
  path=urllib.parse.unquote(urllib.parse.urlsplit(path).path)
  if path.startswith('/vendor/'):base=vendor;rel=path[8:]
  elif path.startswith('/models/'):base=root/'converted';rel=path[8:]
  else:base=root/'review';rel=path.lstrip('/') or 'index.html'
  result=(base/rel).resolve()
  return str(result if result.is_relative_to(base.resolve()) else root/'__missing')
http.server.ThreadingHTTPServer(('127.0.0.1',8094),Handler).serve_forever()
