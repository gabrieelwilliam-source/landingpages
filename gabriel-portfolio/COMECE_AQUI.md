# GABRIEL · PORTFÓLIO INTERATIVO — PACOTE DE CONTINUIDADE PARA CODEX

**Data:** 27/10/2026 · **Idioma:** pt-BR · **Objetivo:** portfolio público e comercial de Gabriel, como braço de sites e landing pages da zAIon.

## Passo único no Codex
1. Abra este diretório no Codex (ou anexe o ZIP e solicite extração).
2. Cole integralmente `PROMPT_CODEX.md` no chat do Codex.
3. Autorize o Codex a editar apenas este projeto e a rodar instalação, build e testes locais. **Não** autorize deploy externo automaticamente.

## O que este ZIP já contém
- Projeto Next.js + TypeScript sem dependências adicionais para a experiência interativa inicial.
- Alternância **Explorar / Leitura**, navegação pelo teclado e botões touch, seis paradas e conteúdo inicial.
- Foto original recebida do Gabriel: `public_gabriel_foto_original.jpg`; **não é publicada automaticamente**.
- `PROMPT_CODEX.md`, `BRIEFING_E_PRD.md`, `CONTEUDO_E_POSICIONAMENTO.md`, `DIRECAO_VISUAL.md`, `CRITERIOS_E_TESTES.md`, `.env.example`.
- Conteúdo editável em `src/data/site.ts`; páginas em `src/app`.

## Para rodar
```bash
npm install
npm run dev
# acessar http://localhost:3000
npm run build
```

## Fatos versus placeholders
O conhecimento disponível sustenta que Gabriel atua/estuda programação, IA e automações, quer apresentar trabalho web, faz parte da proposta zAIon e está em Joinville/SC. NÃO há prova nesta conversa de diplomas, experiência formal, anos de atuação, clientes, resultados, premiações, domínio público, preços, GitHub/LinkedIn/e-mail ou telefone. Por isso não inventar esses dados. Exemplos de portfólio são marcados como **conceituais**. A foto é referência visual e não prova de autorização para publicá-la: confirmar a autorização antes do deploy.

## Decisões de implementação
Não copiar código, sprites, estrutura exclusiva nem artes do site de referência. Capturar apenas conceito de navegação: percurso lateral, progresso por etapas, modo de leitura alternativo. Não usar render de cenário gerado por IA como interface final. Preferir CSS, SVG autoral e tipografia.
