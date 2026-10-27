"""Package tracked/current sources, tested static preview and offline comparison.
Usage: python3 tools/package_review.py --output /path/review.zip --comparison /path/comparison.html
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--comparison', type=Path, required=True)
args = parser.parse_args()
manifest = json.loads((ROOT / 'public/models/manifest.json').read_text())
for asset in manifest['assets']:
    exported = ROOT / '.next-pages/models' / asset['name']
    assert hashlib.sha256(exported.read_bytes()).hexdigest() == asset['sha256'], exported
source_paths = subprocess.check_output(
    ['git', 'ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', ROOT.name + '/'],
    cwd=ROOT.parent,
).decode().split('\0')
files = sorted({ROOT.parent / p for p in source_paths if p})
readme = '''# Gabriel — revisão local, sem publicação

1. Extraia o ZIP inteiro.
2. Abra `gabriel-redesign-comparacao.html` para referências e capturas reais lado a lado.
3. Para navegar no site pronto, execute `python3 iniciar-preview.py` nesta pasta.
   No Windows com Python Launcher, use `py iniciar-preview.py`.
4. No mesmo computador, abra http://127.0.0.1:8000/landingpages/gabriel/ .
   Encerre o servidor com Ctrl+C. Esse endereço é local; não é publicação nem link externo.

O código editável está em `codigo/gabriel-portfolio/` (Node 22/24).
Consulte README.md, RELATORIO_REDESIGN.md e LICENSE_ASSETS.md nessa pasta.
A pasta `site/` contém a exportação estática testada com seu prefixo real.
Não abra index.html diretamente por file://: os scripts precisam do servidor local.

Dez E2E e onze testes unitários aprovados; veja os logs e capturas no código.
A aceitação artística continua parcial: avatar estilizado, fidelidade às concept arts
não integral e desempenho em hardware físico ainda pendente. Não foi publicado.
A foto pessoal original não integra este pacote.
'''
server = '''from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
base = Path(__file__).resolve().parent
root = base / "site"
class ReviewHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        if path.split("?")[0] == "/comparacao.html":
            return str(base / "gabriel-redesign-comparacao.html")
        return super().translate_path(path)
server = ThreadingHTTPServer(("127.0.0.1", 8000), partial(ReviewHandler, directory=str(root)))
print("Gabriel — revisão LOCAL, sem publicação")
print("Abra no mesmo computador: http://127.0.0.1:8000/landingpages/gabriel/")
print("Comparação: http://127.0.0.1:8000/comparacao.html")
print("Ctrl+C para encerrar")
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
'''
revision = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip()
with zipfile.ZipFile(args.output, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
    archive.writestr('LEIA-ME_REVISAO.md', readme)
    archive.writestr('iniciar-preview.py', server)
    archive.writestr('VERSION.txt', revision + '\nBackup: backup-before-blender-redesign-20261027\nSem push/deploy\n')
    archive.write(args.comparison, 'gabriel-redesign-comparacao.html')
    for file in files:
        if not file.is_file():
            continue
        assert 'foto' not in file.name.lower() and 'photo' not in file.name.lower(), file
        assert not file.name.startswith('.env') or file.name.endswith('.example'), file
        archive.write(file, Path('codigo/gabriel-portfolio') / file.relative_to(ROOT))
    for file in sorted((ROOT / '.next-pages').rglob('*')):
        if file.is_file():
            archive.write(file, Path('site/landingpages/gabriel') / file.relative_to(ROOT / '.next-pages'))
with zipfile.ZipFile(args.output) as archive:
    assert archive.testzip() is None
    assert len([n for n in archive.namelist() if n.startswith('site/') and n.endswith('.glb')]) == 7
print('PASS: source + static preview + comparison, ZIP CRC verified:', args.output, args.output.stat().st_size, 'bytes')
