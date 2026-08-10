# AcervoTCC

Plataforma web responsiva para reunir, organizar e compartilhar Trabalhos de Conclusão de Curso de uma instituição de ensino técnico.

## Funcionalidades desta versão

- página inicial institucional e responsiva;
- catálogo com pesquisa combinada e filtros por curso, ano, área e orientador;
- ordenação por data, visualizações e título;
- página de detalhes e trabalhos relacionados;
- trilha “Aprenda a fazer seu TCC” com 11 módulos;
- Banco de Ideias com status visuais;
- painel demonstrativo e base preparada para autenticação e persistência;
- estrutura MVC em Express e EJS, compatível com execução local e Vercel.

## Executar localmente

```bash
npm install
npm start
```

Acesse `http://localhost:3001`.

## Estrutura

```text
api/          entrada serverless
controllers/  regras de apresentação e filtros
data/         dados demonstrativos
public/       CSS e JavaScript do navegador
routes/       rotas Express
views/        páginas e componentes EJS
```

## Próximas etapas

Integrar MongoDB, autenticação por perfil, upload seguro de PDFs, fluxo de revisão, comentários, moderação, favoritos e painel administrativo.
