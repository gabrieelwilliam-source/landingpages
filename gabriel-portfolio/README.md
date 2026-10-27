# Gabriel · Web & Digital

Portfólio em pt-BR com leitura convencional e percurso interativo leve. Base Next.js/TypeScript recebida no pacote, refinada sem substituir a landing page existente na raiz do repositório.

## Desenvolvimento

Node.js 22 ou 24 e npm. Validado com Node 24.19.0, npm 11.9.0 e Next.js 15.5.28 (versão resolvida no lockfile).

```bash
cd /workspace/landingpages/gabriel-portfolio
npm ci --cache /tmp/gabriel-npm-cache --no-audit --no-fund
npm run dev -- --hostname 0.0.0.0
```

O cache explícito evita depender de um diretório pessoal gravável. Nenhuma credencial é necessária. Não é necessário criar worktree: cada tarefa na nuvem já é isolada.

## Verificações

```bash
npm run build
npm run typecheck
npm test
CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e
```

Pare o servidor de desenvolvimento antes de gerar o build ou executar os testes: ambos usam `.next`. O teste funcional inicia o servidor de produção quando necessário; execute o build antes. Se Chromium não estiver instalado, instale o navegador com `npx playwright install chromium` em uma máquina com acesso ao domínio oficial. Não desative TLS nem verificações. Testes incluem três resoluções, axe, salto/colisão, pausa, checkpoints, contexto, contato sem envio, conceitos, 404 e leitura sem JavaScript. Capturas locais ficam em `test-results/` (ignorado pelo Git).

Para revisar o build já gerado:

```bash
npm run start -- --hostname 0.0.0.0
```

## Experiência

Leitura é o padrão. Explorar: focar o percurso com Tab ou toque, usar ←/→ ou A/D e espaço para pular blocos. Mobile tem botões de movimento com captura do ponteiro e Pular. Há seis checkpoints diretos; jogar nunca é obrigatório. Pausar interrompe a física; a preferência de movimento reduzido elimina animações decorativas, mantendo os comandos disponíveis. A alternância conserva o capítulo. Perda de foco limpa as teclas para evitar movimento preso.

Todo o conteúdo principal é HTML pré-renderizado. As páginas dos conceitos têm demonstrações autorais e não alegam clientes ou resultados reais. O formulário valida os campos e gera apenas um resumo copiável em memória; recarregar a página apaga os dados. Não há backend, armazenamento persistente ou integração com n8n.

## Conteúdo e configuração

- `src/data/site.ts`: perfil, capítulos, serviços, conceitos e textos das demonstrações.
- `src/components/Avatar.tsx`: SVG original, sem dependência da foto.
- `src/lib/physics.mjs`: limites, gravidade, salto e colisões laterais simples.
- `src/app/projetos/[slug]/page.tsx`: casos estáticos.
- `src/app/layout.tsx`, `robots.ts`, `public/favicon.svg`: metadados, bloqueio de indexação e ícone autoral.

O arquivo de foto fornecido permanece na raiz privada do projeto, fora de `public/`; não é servido pelo Next.js. Não o mova para `public/` sem autorização. Nenhuma imagem gerada por IA ou asset de referência foi utilizado.

## Antes de publicar

Esta entrega não realiza deploy, push nem configuração de domínio. A indexação está desativada por `robots` e metadados, mas isso não substitui controle de acesso para uma hospedagem privada.

Confirmar bio, serviços, nome profissional, contatos, domínio e vínculo/link oficial da zAIon; validar evidências e atribuição antes de adicionar projetos reais. A foto real exige aprovação específica caso se deseje exibi-la. Após aprovação explícita do deploy, usar uma hospedagem Next.js compatível, configurar o diretório raiz como `gabriel-portfolio`, revisar metadados com domínio real e então habilitar indexação/sitemap. O sitemap foi adiado porque não há domínio confirmado. A integração de contato precisa de destino real, configuração segura e avaliação de privacidade antes de coletar dados.

Os documentos originais do pacote permanecem disponíveis para orientar a revisão. Consulte `RELATORIO_EXECUCAO.md` para os resultados reais desta entrega.

## Publicação de teste no GitHub Pages

Autorização para publicar a versão de teste recebida após a entrega inicial. A landing page anterior continua na raiz; o portfólio estático ocupa somente `/gabriel/`.

```bash
npm run build:pages
CHROMIUM_PATH=/usr/bin/chromium npm run test:pages
```

`next.config.ts` ativa exportação estática e o prefixo `/landingpages/gabriel` somente nesse build; o fluxo normal Next.js permanece disponível. A saída fica em `.next-pages/` (ignorada). O build também usa `.next` internamente: não rodar em paralelo com servidores Next.js.

Os arquivos exportados são copiados para `../gabriel/` e versionados para hospedagem sem CI. A raiz do repositório contém `.nojekyll` para disponibilizar os assets `_next`. No GitHub, Settings → Pages deve usar **Deploy from a branch → main → / (root)**. Se já estiver assim, o push inicia a atualização automaticamente; não substituir a raiz pelo código do portfólio.

Endereço previsto após ativação bem-sucedida: `https://gabrieelwilliam-source.github.io/landingpages/gabriel/`. A verificação pública depende do acesso de rede a esse domínio. Autorizar publicação não autoriza exibir a foto pessoal: ela continua excluída.

Publicação inicial confirmada: https://gabrieelwilliam-source.github.io/landingpages/gabriel/ — GitHub Pages concluiu o build e os 30 artefatos públicos foram conferidos por HTTPS contra a saída testada localmente. A raiz continua exibindo a FR Distribuidora.
