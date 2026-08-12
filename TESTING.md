# Como testar o AcervoTCC

Este roteiro cobre a instalação, os acessos rápidos de aluno e professor e o fluxo completo até um TCC aparecer no catálogo público.

## 1. Pré-requisitos

- Node.js 18 ou superior;
- npm;
- MongoDB local ou uma conexão do MongoDB Atlas;
- um arquivo PDF pequeno e válido para simular a entrega.

Confira as versões:

```bash
node --version
npm --version
```

## 2. Preparar o projeto

Na pasta do projeto:

```bash
git switch feat/acervotcc-completo
cp .env.example .env
npm install
```

Abra o arquivo `.env` e mantenha as configurações de desenvolvimento. Acrescente valores privados próprios:

```dotenv
BASE_URL=http://localhost:3001
PORT=3001
NODE_ENV=development
DEV_QUICK_LOGIN=true

MONGODB_URI=mongodb://127.0.0.1:27017/acervotcc
SESSION_SECRET=crie-uma-frase-secreta-longa-e-diferente

ALUNO_EMAIL_DOMAINS=academico.ifsul.edu.br
PROFESSOR_EMAIL_DOMAINS=ifsul.edu.br

ADMIN_EMAIL=admin@seu-dominio-institucional.edu.br
ADMIN_PASSWORD=crie-uma-senha-com-12-ou-mais-caracteres
```

Se usar o MongoDB Atlas, substitua `MONGODB_URI` pela conexão fornecida pelo serviço. Não publique o arquivo `.env` nem compartilhe suas senhas.

## 3. Preparar o banco vazio

Execute:

```bash
npm run seed
```

O comando é seguro para ser repetido. Ele prepara o administrador, as configurações e os 11 módulos do tutorial, mas não cria cursos nem turmas.

Se você já executou uma versão anterior do projeto e ainda vê dados fictícios, faça a limpeza explícita uma única vez:

```bash
npm run limpar:acervo -- --confirmar
npm run seed
```

Essa limpeza apaga cursos, turmas, TCCs, ideias, comentários e denúncias. As contas, as configurações e a trilha são preservadas. Não use o comando em um banco com dados reais que devam ser mantidos.

## 4. Cadastrar seu primeiro curso e sua primeira turma

1. Inicie o projeto com `npm start` e acesse `http://localhost:3001`.
2. Entre com o e-mail e a senha de administrador definidos no `.env`.
3. Abra **Administração → Cursos**.
4. Clique em **Novo curso**, informe nome, sigla e descrição e salve.
5. Clique em **Nova turma**, escolha o curso, informe o nome e o ano e salve.

O botão **Nova turma** aparece depois que existe pelo menos um curso ativo.

## 5. Iniciar e navegar

```bash
npm start
```

Acesse [http://localhost:3001](http://localhost:3001). Verifique inicialmente:

1. Página inicial, pesquisa e filtros rápidos;
2. catálogo de TCCs e combinação dos filtros;
3. detalhe de um trabalho, contador de visualizações e download do PDF;
4. seção **Aprenda a fazer seu TCC**, seus 11 módulos e materiais;
5. depois de entrar, Banco de Ideias, filtros, detalhes e comentários;
6. layout em largura de celular nas ferramentas de desenvolvedor do navegador.

Sem autenticação, o menu e a página inicial não exibem o Banco de Ideias. A tentativa de abrir `/ideias` diretamente deve levar à tela de login; o catálogo de TCCs continua público.

## 6. Preparar e testar as contas rápidas

1. Saia da conta administrativa e, na tela **Entrar**, clique uma vez em **Entrar como professor**. Depois, saia.
2. Clique uma vez em **Entrar como aluno**. Depois, saia.
3. Entre novamente como administrador e abra **Administração → Usuários**.
4. Abra a conta **Aluno de Teste**, selecione o curso e a turma que você cadastrou e salve.

Agora teste como aluno:

1. Abra **Entrar**.
2. Na caixa amarela de desenvolvimento, clique em **Entrar como aluno**.
3. Abra **Enviar TCC**.
4. Confirme o curso e a turma que você vinculou no bloco acadêmico. O aluno não consegue alterá-los.
5. Preencha título, resumo, autores, palavras-chave, ano e área.
6. Selecione **Professor de Teste** como orientador.
7. Anexe um PDF válido, aceite o termo de autorização e escolha **Enviar para avaliação**.
8. Confirme que o status passou para **Enviado**.
9. Abra a trilha de aprendizagem e marque um módulo como concluído.
10. Publique uma ideia, comente e salve um TCC ou uma ideia como favorito;
11. volte ao painel e abra **Meus favoritos** para conferir e remover os itens salvos;
12. confirme que o painel do aluno mostra apenas os atalhos, sem o bloco **Visão geral**;
13. saia da conta.

O aluno pode editar um rascunho ou um trabalho em **Correções solicitadas**, mas não pode aprovar nem liberar o próprio TCC. Professor e administrador não possuem botão nem permissão para criar um envio.

## 7. Testar como professor e liberar para o site

1. Entre novamente e clique em **Entrar como professor**.
2. No painel, confira a **Visão geral** e **Aguardando revisão**. Confirme também que não existe botão para enviar um TCC.
3. Abra o trabalho enviado pelo aluno. Somente trabalhos orientados por esse professor ficam disponíveis para ele.
4. Escolha **Aguardando revisão** para registrar o início da análise.
5. Escolha **Correções solicitadas** e escreva uma observação para testar a devolução ao aluno; ou escolha **Aprovado** para concluir a avaliação.
6. Quando o TCC estiver **Aprovado**, abra-o novamente. A ação **Liberar para o site** aparecerá separadamente.
7. Confirme a liberação. O histórico deve registrar o professor, a data e a observação.
8. Saia da conta e procure o título no catálogo público.

Esse é o diferencial do fluxo: **aprovar a avaliação não publica o trabalho**. Somente o professor orientador pode executar a liberação final, e o termo de autorização do aluno precisa estar aceito.

Para testar as correções, entre novamente como aluno, abra o trabalho devolvido, substitua o PDF e envie. O status será **Reenviado** e o professor poderá revisar outra vez.

## 8. Testar moderação e administração

Como professor:

1. Abra uma ideia e use **Alterar status e moderar**;
2. marque-a como **Reservada** ou **Em desenvolvimento** e escolha o aluno ou professor responsável;
3. marque-a como **Utilizada** e, se houver, vincule o TCC publicado que nasceu da proposta;
4. volte à lista e aos detalhes da ideia para conferir a indicação de livre, em uso ou já utilizada;
5. em um comentário, use **Ocultar como moderador**;
6. confira os itens de revisão e denúncias no painel.

Como administrador, use o e-mail e a senha definidos em `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Confira:

- definição de curso e turma antes da aprovação de uma conta de aluno;
- aprovação, ativação e perfil dos usuários;
- cadastro de cursos e turmas;
- edição dos módulos da trilha;
- denúncias e configurações institucionais;
- indicadores do painel administrativo.

O administrador vê a **Visão geral** e gerencia os TCCs existentes, mas não cria envios e não executa a liberação final para o catálogo; essa confirmação pertence ao professor orientador.

Cadastros sem relacionamentos podem ser excluídos. Cursos, turmas e usuários que já participam do histórico são desativados, evitando que TCCs publicados fiquem com informações quebradas.

Um usuário não consegue escolher o perfil de administrador no cadastro.

## 9. Executar verificações automáticas

Em outro terminal, com o projeto parado ou em execução:

```bash
npm test
npm audit --omit=dev
```

Os testes verificam páginas públicas vazias, incremento atômico de visualizações, CSRF, autenticação de desenvolvimento, domínios institucionais, modelos, permissões do fluxo de TCC e integridade dos 11 módulos.

## 10. Testar o cadastro institucional

Os botões rápidos existem apenas em desenvolvimento. Para testar o cadastro normal:

1. abra **Criar conta**;
2. use um endereço que termine em `@academico.ifsul.edu.br` para aluno ou `@ifsul.edu.br` para professor;
3. confirme o e-mail pelo link exibido no terminal quando o SMTP não estiver configurado;
4. entre como administrador e aprove a conta;
5. faça login com a nova conta.

O perfil é inferido pelo domínio. Não há um seletor que permita ao usuário se declarar professor ou administrador.

## 11. Problemas comuns

- **O banco não conecta:** revise `MONGODB_URI`; no Atlas, confira usuário, senha, rede autorizada e caracteres especiais da conexão.
- **Os botões rápidos não aparecem:** confirme `NODE_ENV=development` e `DEV_QUICK_LOGIN=true`, depois reinicie o servidor.
- **Não há professor no formulário de TCC:** entre uma vez com o botão **Professor** para criar a conta rápida.
- **O aluno não consegue enviar TCC:** entre como administrador e vincule um curso e uma turma ativos à conta do aluno.
- **Cursos antigos continuam aparecendo:** execute `npm run limpar:acervo -- --confirmar` somente se puder apagar todo o conteúdo acadêmico atual.
- **O seed recusa a senha:** `ADMIN_PASSWORD` precisa ter pelo menos 12 caracteres.
- **O PDF é rejeitado:** use um PDF real; renomear outro tipo de arquivo para `.pdf` não é suficiente.
- **A porta já está em uso:** altere `PORT` e `BASE_URL` no `.env`.

## 12. Antes de colocar em produção

Use, no mínimo:

```dotenv
NODE_ENV=production
DEV_QUICK_LOGIN=false
SESSION_SECRET=uma-chave-longa-aleatoria-e-exclusiva
```

Configure HTTPS, SMTP institucional, credenciais próprias, backup do MongoDB e limites adequados de armazenamento. Nunca reutilize contas, senhas ou dados de teste como dados reais.
