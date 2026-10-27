# Direção visual — menos cara de IA

## Princípios
Design editorial e funcional, contraste elegante, ritmo de layout, grids visíveis discretos. Nada de castelos, montanhas gigantes, planetas, hologramas decorativos, overlays falsos ou ilustrações com mãos erradas. O site TEM que parecer construído por um designer/desenvolvedor.

## Tokens iniciais
- Fundo principal `#101822` (azul quase preto)
- Superfície `#172332`
- Superfície clara `#F3F0E8` para sessões de contraste pontuais
- Ouro destaque `#C5A66B` — usar com moderação
- Texto `#F2F2EC`
- Texto auxiliar `#AFBDC7`
- Linhas `rgba(240,244,248,.14)`
- Espaçamentos em múltiplos de 4/8; layout fluido max-width ~1180px
- Sans nativa ou fonte open-source com licença adequada, evitar download clandestino de fontes

## Avatar Gabriel
Arte SVG ou sprite vetorial original: cabeça raspada/cabelo curto, barba longa, olhos claros, roupa casual escura, escala pequena à esquerda da jornada. Ideal: não tentar retrato fotorrealista. Criar estados em CSS/SVG para idle/walk/jump, no mínimo 2 frames distinguíveis. Foto de referência em raiz do pacote, NÃO copiar automaticamente para `public/`.

## Experiência 2D
Percurso com linhas de chão, plataformas geométricas, placas e seis checkpoints. Fundo com tipografia grande, formas simples e números de capítulos. Avatar se move de verdade. Priorizar movimento consistente em vez de mundo gigante sem função.

## Grid/layout
Desktop 12 colunas, mobile uma; tipografia hero forte; projetos com cards de case legíveis; poucas bordas finas, CTA bem visível. Sem glassmorphism repetitivo ou glow exagerado.

## Movimento
Curto, funcional, respeita `prefers-reduced-motion`. Não travar scroll. Não exigir jogar para acessar conteúdos.
