# Critérios de aceite e testes

## Essenciais
1. `npm install` e `npm run build` sem erros; reportar comandos e saídas reais.
2. Funcionar em 360px, 768px, 1440px; sem barra horizontal inesperada ou texto sobreposto.
3. Navegação Leitura acessível por teclado com links sem JS complexo; modo Explorar acessível via mouse, teclado e touch.
4. Controles e atalhos: A/D e ←/→ movimento, Espaço pula; bloquear apenas teclas necessárias quando o modo de jogo estiver ativo e não houver foco em input.
5. Pausa de animação preferida pelo sistema e sem efeitos estroboscópicos.
6. Todos os projetos sem prova marcados como "Conceito", nunca "Cliente".
7. Contato não envia dados a destino inválido ou simula sucesso.
8. SEO: idioma pt-BR, título/descrição e cabeçalhos hierárquicos.
9. Foto não deve ser publicada sem autorização explícita.
10. Links externos devem ser verdadeiros e HTTPS; sem href "#" para CTAs não implementados.

## QA manual sugerido
- Alternar Leitura/Explorar e retornar ao mesmo capítulo.
- Testar ← →, A/D, Espaço, clique nas fases, leitura sem jogo.
- Testar iPhone pequeno e Android: controles touch sem conflitos com scroll.
- Forçar prefers-reduced-motion via devtools.
- Simular links/contatos ausentes e verificar fallback claro.
- Verificar Lighthouse quando ambiente permitir (não afirmar nota sem executar).

## Checklist antes de deploy
[ ] Aprovação do Gabriel para bio/foto/uso do nome
[ ] Contatos fornecidos e validados
[ ] Links dos projetos revisados
[ ] Página de privacidade se forem coletados dados
[ ] Testes de build e navegação documentados
[ ] Aprovação explícita para publicar e apontar domínio
