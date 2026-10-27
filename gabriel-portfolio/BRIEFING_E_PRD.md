# Briefing e PRD — Gabriel Web / by zAIon

## Visão
Portfólio pessoal-comercial de Gabriel, integrado à marca zAIon de forma discreta. Converter visitantes em potenciais clientes para sites institucionais, landing pages, portfólios e experiências digitais, além de apoiar candidaturas profissionais.

## Referência conceitual
https://www.pvwebprojects.com/pedro/ — site com avatar que atravessa seções, teclado para movimentar/pular e alternativa convencional de scroll. Não reproduzir assets, conteúdo nem composição.

## Público
Empreendedores/empresas que precisam de presença digital; pessoas de marketing que precisam de landing pages; gestores de tecnologia/recrutadores.

## Proposta de valor (copy provisória)
"Sites que apresentam seu negócio com clareza — e experiências digitais que fazem a diferença." Evitar promessas numéricas.

## Fluxos
1. Entrada -> escolher Explorar / Apenas ler.
2. Explorar -> instruções acessíveis -> deslocamento entre seis checkpoints -> conteúdos acionáveis -> contato.
3. Leitura -> hero -> sobre -> serviços -> projetos -> processo -> conexão zAIon -> contato.
4. Alternância preserva fase atual.
5. Contato não apresenta número/e-mail inventados.

## Requisitos funcionais
- [ ] Game mode com movimento lateral, salto e camera/progresso coerente; navegação por teclado e touch.
- [ ] Leitura clássica e âncoras estáveis.
- [ ] Gestão de conteúdo via fonte local tipada.
- [ ] Projetos reais somente após links/evidências/atribuição da participação de Gabriel.
- [ ] Projetos demonstrativos explicitamente marcados CONCEITO.
- [ ] Acessibilidade: foco visível, contraste AA, sem motion compulsório, textos selecionáveis, navegação por teclado.
- [ ] SEO essencial e compartilhamento.
- [ ] Nenhum envio falso de contato; formulário integrado somente após credencial/configuração segura.

## Não objetivos v1
CMS externo, autenticação, e-commerce, dashboard, captação automatizada n8n, backend próprio complexo, contratação de serviços pagos, produção de material hiper-realista por IA.

## Medidas de sucesso
Compreensão em até ~5 segundos do que Gabriel oferece; usuário consegue acessar Projetos e Contato em 1–2 cliques mesmo sem jogar; bom uso mobile; nenhum dado profissional fictício.

## Stack
Next.js / React / TypeScript, CSS autoral e SVG para ilustrações; GSAP/Phaser apenas se trazem benefício claro, pesando tradeoff de bundle e a11y. Deploy futuro Vercel ou hospedagem compatível (confirmar infraestrutura antes).
