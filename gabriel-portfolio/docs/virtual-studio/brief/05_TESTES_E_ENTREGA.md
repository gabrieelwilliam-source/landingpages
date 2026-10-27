# TESTES, EVIDÊNCIAS E RELATÓRIO DE ENTREGA

## Qualidade funcional
- [ ] Visitante entra e escolhe guiado ou livre, sem WebGL error.
- [ ] Scroll para baixo move o cenário à frente; scroll para cima retorna com suavidade; Gabriel permanece no enquadramento.
- [ ] Modo livre movimenta Gabriel em múltiplas direções, com colisão e câmera coerentes.
- [ ] Trocar livre ↔ guiado ↔ clássico não apaga estado nem trava input.
- [ ] NPCs executam rotina sem atravessar mobília; recepção tem diálogo/menu útil.
- [ ] Todos os setores interligados são alcançáveis; todos os pontos de interesse abrem conteúdo correto.
- [ ] Teclado, Escape, foco e touch funcionam; formulário/links têm validação real.
- [ ] Modo clássico contém todas as informações essenciais; fallback WebGL válido.
- [ ] Mobile portrait/landscape, reduzir movimento, carregamento lento e conexões instáveis.

## Qualidade visual
- [ ] Sem bonecos de cubos, luz chapada, corredores repetidos, fontes minúsculas, clipping e materiais plásticos.
- [ ] Logo oficial idêntico ao fornecido, legível e em local coerente.
- [ ] Capturas reais desktop 1440x900, laptop ~1366x768, mobile 390x844; inspecionar áreas 1, 2, 3, lab e reunião.
- [ ] Referências visuais são direção artística; não falsificar captura do aplicativo como render de referência.

## Técnica
- [ ] Instalação reproduzível, types/lint/build verdes, testes automáticos do fluxo principal.
- [ ] Relatar FPS estimado e configuração de teste com dados verdadeiros; comportamento sob perfil de qualidade baixa.
- [ ] Relatório de assets/licenças, tamanho e fonte; sem chamadas a endpoints privados.
- [ ] README: instalar, executar, testar, trocar conteúdo, configurar links, publicar após autorização.

## Modelo do relatório final
1. Estado inicial e backup/commit
2. Arquivos modificados
3. Funcionalidades implementadas (com evidência)
4. Capturas reais e roteiro testado
5. Dependências e licenças
6. Pendências e limitações com gravidade
7. Como executar e próximos passos para publicação (sem publicar)
