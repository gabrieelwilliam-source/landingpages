> Documento histórico da versão anterior. Para os GLBs, texturas, rig e logo da reconstrução atual, consulte [LICENSE_ASSETS.md](LICENSE_ASSETS.md).

# Assets e licenças
Arquitetura, avatar, esculturas, superfícies gráficas e favicon: geometrias/CSS/SVG procedurais autorais deste projeto. Nenhum modelo de terceiro, textura baixada, imagem IA ou fotografia de cliente é usado. Three.js é distribuído sob MIT; React/Next.js e demais bibliotecas conservam suas licenças no gerenciador de dependências. Fontes de sistema (Arial/Georgia e alternativas) sem arquivos redistribuídos.

O personagem é uma representação estilizada procedural. Não é um modelo facial fotogramétrico, não possui retargeting de captura de movimento e não se alega semelhança fotorrealista. A barba, cabelo curto, olhos claros e figurino discreto seguem a referência fornecida. A foto original não está incluída em public.

`public/concepts/*.png`: capturas feitas com Chromium das próprias páginas `/projetos/conceito-landing`, `/projetos/conceito-portfolio` e `/projetos/conceito-site`. São demonstrações conceituais autorais, não screenshots de clientes. O relevo mineral é um DataTexture determinístico gerado por código, sem imagem de banco externo.


## Escritório contínuo — revisão 27/10/2026
Os seis `public/models/environment-*.glb` foram substituídos por geometria original gerada em `tools/build_office.py`: fachada envidraçada, estrutura/teto contínuos, pisos, balcão, estantes, mesas, teclados, cadeiras, sofás, luminárias e vegetação. As texturas de pedra e madeira e mapas de rugosidade são procedurais originais, incorporados aos GLBs e comprimidos como WebP. Não há downloads ou texturas de terceiros novos. O gerador reutiliza somente as funções geométricas locais de `build_assets.py`, preservando o Gabriel rigado já existente.

As imagens enviadas são referência de direção artística e não foram usadas como falsos fundos/capturas do aplicativo. A foto pessoal não foi incorporada. O logo original foi mantido, com o mesmo SHA-256. Os diagramas do laboratório são desenhos locais originais, rotulados como conceitos, sem integrações reais. As informações essenciais também aparecem em HTML no painel e no modo clássico.
