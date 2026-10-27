"""Create a standalone, offline comparison of supplied concepts and real captures.
Usage: python3 tools/build-review.py /path/to/Gabriel_3D_Redesign_Final /path/to/comparacao.html
Never reads ASSETS_ORIGINAIS or the personal photograph.
"""
import base64, html, json, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
REF = pathlib.Path(sys.argv[1])
OUT = pathlib.Path(sys.argv[2])
DOC = ROOT / 'docs/redesign'
def picture(path, caption, mobile=False):
    data = base64.b64encode(path.read_bytes()).decode()
    return f'<figure class="{"mobile" if mobile else ""}"><figcaption>{html.escape(caption)}</figcaption><img loading="lazy" src="data:image/png;base64,{data}" alt="{html.escape(caption)}"></figure>'
def pair(title, ref, actual, note, mobile=False):
    return f'<section><h2>{title}</h2><p>{note}</p><div class="pair">'+picture(REF/ref,'REFERÊNCIA FORNECIDA — concept art, não é o site')+picture(DOC/actual,'CAPTURA REAL — Chromium, versão local',mobile)+'</div></section>'
body = '''<header><small>GABRIEL. / REVISÃO LOCAL / 27.10.2026</small><h1>Referências e execução real.</h1><p>Comparação privada de revisão. Sem publicação. As imagens de referência são concept arts fornecidas pelo usuário. As demais foram capturadas no navegador, sem substituir o cenário por imagens nem editar o conteúdo das capturas.</p><p><strong>Estado:</strong> seis ambientes e navegação implementados. A fidelidade artística está parcial: avatar estilizado, materiais e densidade inferiores às referências. As capturas usam o caminho gráfico simplificado de um Chromium headless com renderização por software; não validam a aparência PBR numa GPU física.</p><nav><a href="#portal">Portal</a><a href="#atelier">Ateliê</a><a href="#mobile">Mobile</a><a href="#antes">Antes/depois</a><a href="#ambientes">Seis ambientes</a><a href="#medidas">Medições</a></nav></header>'''
body += '<div id="portal">'+pair('01 · Abertura e perspectiva','REFERENCIAS_VISUAIS/01_HERO_PERSPECTIVA_E_NAVEGACAO.png','final-portal-1440.png','Adotados ponto de fuga em profundidade, figura humana de costas, paleta grafite/bronze, luz quente e interface de canto. O resultado não tem a densidade, paisagismo, reflexos e anatomia fotográfica da referência. O HUD foi reduzido em relação ao estado anterior.')+'</div>'
body += '<section><h2>Mesmo portal, caminho PBR</h2><p>Captura real adicional com a extensão de diagnóstico do renderer desativada pelo teste, exercitando os materiais PBR, probe e texturas WebP. Ainda é Chromium por software, com exploração pausada; não é prova de desempenho ou de aparência em GPU física. Não foi aplicada edição à captura.</p>'+picture(DOC/'pbr-portal-software.png','CAPTURA REAL · caminho PBR em teste instrumentado, software WebGL')+'</section>'
body += '<div id="atelier">'+pair('02 · Espaço de criação e galeria','REFERENCIAS_VISUAIS/02_ATELIER_AMBIENTES_INTERATIVOS.png','final-room-3.png','Workstations com capturas das demonstrações existentes, mobiliário autoral e abertura de serviços em DOM. A galeria abaixo usa três displays reais e painéis de detalhes. Faltam a riqueza de revestimentos e a iluminação indireta da concept art.')+'</div>'
body += '<div id="mobile">'+pair('03 · Jornada e composição móvel','REFERENCIAS_VISUAIS/03_JORNADA_SECOES_E_MOBILE.png','final-portal-390.png','Mantidos Gabriel e serviços web: os claims de IA e o rosto genérico da colagem não foram copiados. Modos Scroll/Caminhar/Clássico, swipe, seis atalhos e pausa permanecem disponíveis. O personagem fica à direita no celular para liberar a coluna de leitura.',True)+'</div>'
body += '<section id="antes"><h2>Estado anterior × reconstrução</h2><p>As duas capturas antigas documentam o problema inicial. A implementação atual substitui a geometria de execução por modelos GLB autorais, com skin e animações. A qualidade visual continua estilizada, portanto esta comparação não é uma declaração de paridade fotorrealista.</p><div class="pair">'
for f in sorted((REF/'ESTADO_ANTERIOR').glob('*.png')):
    body += picture(f,'ANTES — captura fornecida no pacote')
body += picture(DOC/'final-portal-1280.png','AGORA — captura real 1280 × 900')+picture(DOC/'final-room-4.png','AGORA — galeria, captura real')+'</div></section>'
body += '<section id="ambientes"><h2>Seis ambientes em execução</h2><div class="pair">'
for i, title in enumerate(['Portal','Átrio de ideias','Ateliê Digital','Galeria','Laboratório zAIon','Destino / contato'],1):
    body += picture(DOC/f'final-room-{i}.png',f'CAPTURA REAL · 0{i} / {title}')
body += '</div></section><section><h2>Celular e orientação horizontal</h2><div class="pair">'
body += picture(DOC/'final-portal-360.png','CAPTURA REAL — 360 × 844',True)
body += picture(DOC/'final-landscape-dialog.png','CAPTURA REAL — 844 × 390, painel e logo original')
body += '</div></section>'
perf=json.loads((DOC/'performance.json').read_text())
body += '<section id="medidas"><h2>Dados medidos e limites</h2><p>Amostra de aproximadamente três segundos, Scroll ativo, Chromium headless Linux com WebGL por software. Não representa teste em Android/iPhone ou GPU dedicada. O caminho PBR de GPU ainda precisa de validação física. A leitura clássica evita esse custo.</p><pre>'+html.escape(json.dumps(perf,indent=2,ensure_ascii=False))+'</pre><p>Consulte RELATORIO_REDESIGN.md para os comandos, matriz de aceite e pendências. Nenhum contato fictício ou envio de formulário foi habilitado. Foto pessoal ausente deste documento.</p></section>'
style='''*{box-sizing:border-box}body{margin:0;background:#0b151e;color:#edeae2;font:16px/1.65 system-ui,sans-serif}header,section{max-width:1500px;margin:auto;padding:38px clamp(18px,4vw,60px)}header{padding-top:70px}small,figcaption{color:#ceb07b;font-size:12px;letter-spacing:.07em}h1,h2{font-family:Georgia,serif;font-weight:400;line-height:1.15}h1{font-size:clamp(40px,5vw,70px)}h2{font-size:34px}p{max-width:950px;color:#c7d0d4}nav{display:flex;gap:12px;flex-wrap:wrap}a{color:#dfc18e}nav a{padding:8px 15px;border:1px solid #6a604c;border-radius:24px;text-decoration:none}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}figure{margin:0;background:#111e29;padding:12px;align-self:start}figcaption{margin-bottom:12px}img{max-width:100%;height:auto;display:block}figure.mobile img{max-height:780px;margin:auto}pre{white-space:pre-wrap;overflow-wrap:anywhere;padding:20px;background:#111e29;color:#cedbe3}section{border-top:1px solid #293640}@media(max-width:800px){.pair{grid-template-columns:1fr}}'''
OUT.write_text('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gabriel — comparação visual de revisão</title><style>'+style+'</style>'+body+'</html>')
print('Comparison written:', OUT, OUT.stat().st_size, 'bytes; no photograph included.')
