# AcervoTCC

Aplicação completa para reunir, revisar, publicar e consultar Trabalhos de Conclusão de Curso. A organização segue o padrão MVC do projeto `DAWII-Adocao`: Express, EJS, Mongoose, controllers em classes, rotas e views separadas por módulo.

## Funcionalidades

- cadastro, confirmação de e-mail, recuperação de senha e aprovação de contas;
- perfis de aluno, professor e administrador com autorização por rota;
- fluxo completo de TCC: rascunho, envio, revisão, correções, aprovação, publicação e arquivamento;
- upload de PDF e capa no MongoDB com validação e limite de tamanho;
- catálogo público com pesquisa, filtros combinados, visualizações e downloads;
- Banco de Ideias, favoritos, comentários, denúncias e moderação;
- trilha de aprendizagem com 11 módulos e progresso individual;
- gestão de usuários, cursos, turmas, módulos, denúncias e configurações;
- painéis específicos por perfil, proteção CSRF, rate limiting e sessões seguras.

## Executar localmente

```bash
cp .env.example .env
npm install
npm run seed
npm start
```

Acesse `http://localhost:3001`.

## Estrutura

```text
api/          entrada serverless da Vercel
config/       conexão MongoDB e envio de e-mails
controllers/  regras de negócio em classes
middlewares/  autenticação, permissões, CSRF, erros e upload
models/       schemas Mongoose
public/       CSS e JavaScript do navegador
routes/       rotas Express por módulo
scripts/      carga inicial do banco
views/        páginas e componentes EJS
```

## Configuração

`MONGODB_URI` e `SESSION_SECRET` são obrigatórias em produção. Para confirmação de e-mail e recuperação de senha, configure também as variáveis `SMTP_*`. Sem SMTP, os links são mostrados apenas no console em desenvolvimento.

O `seed` cria cursos, turmas, os 11 módulos e a conta administrativa definida em `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Troque a senha após o primeiro acesso.
