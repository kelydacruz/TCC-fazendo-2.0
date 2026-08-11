# AcervoTCC

Aplicação completa para reunir, revisar, publicar e consultar Trabalhos de Conclusão de Curso. A organização segue o padrão MVC do projeto `DAWII-Adocao`: Express, EJS, Mongoose, controllers em classes, rotas e views separadas por módulo.

## Funcionalidades

- cadastro, confirmação de e-mail, recuperação de senha e aprovação de contas;
- autenticação restrita a domínios institucionais separados para alunos e professores;
- perfis de aluno, professor e administrador com autorização por rota;
- vínculo obrigatório do aluno com curso e turma, impedindo envios para outro curso;
- fluxo completo de TCC: rascunho, envio, revisão, correções, aprovação, publicação e arquivamento;
- separação entre aprovação e publicação: somente o professor orientador libera um TCC aprovado para aparecer no site;
- termo de autorização do aluno, opção de preservar a autoria e histórico com responsável e data;
- upload de PDF e capa no MongoDB com validação e limite de tamanho;
- catálogo público com pesquisa, filtros combinados, visualizações e downloads;
- Banco de Ideias, favoritos, comentários, denúncias e moderação;
- trilha de aprendizagem com 11 módulos e progresso individual;
- gestão de usuários, cursos, turmas, módulos, denúncias e configurações;
- administração compacta com exclusão segura ou desativação de registros vinculados;
- painéis específicos por perfil, proteção CSRF, rate limiting e sessões seguras.

## Executar localmente

```bash
cp .env.example .env
npm install
npm run seed
npm start
```

Acesse `http://localhost:3001`.

O passo a passo completo para configurar o ambiente e validar os acessos de aluno, professor e administrador está em [`TESTING.md`](TESTING.md). O roteiro inclui o fluxo aluno envia → professor avalia → professor libera para o catálogo público.

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

Por segurança, os valores privados não fazem parte do `.env.example`. Adicione ao `.env` local ou ao painel da hospedagem: `MONGODB_URI`, `SESSION_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

`ALUNO_EMAIL_DOMAINS` e `PROFESSOR_EMAIL_DOMAINS` aceitam um ou mais domínios separados por vírgula. O perfil é definido pelo domínio; não existe seleção manual durante o cadastro.

Neste projeto, alunos usam `@academico.ifsul.edu.br` e professores usam `@ifsul.edu.br`.

Para testes locais, `DEV_QUICK_LOGIN=true` mostra botões de acesso rápido para aluno e professor. A rota é bloqueada sempre que `NODE_ENV=production`, mesmo que a flag seja configurada por engano.

O `seed` cria quatro cursos, turmas de anos diferentes, seis TCCs, cinco ideias, comentários, contas rápidas, os 11 módulos completos e a conta administrativa definida em `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Troque a senha após o primeiro acesso.
