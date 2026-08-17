// Funcionalidade exclusiva do AcervoTCC: conteúdo inicial da trilha "Aprenda a fazer seu TCC".
export const modulosTcc = [
    {
        ordem: 1,
        titulo: 'Como escolher um tema',
        explicacao: 'Um bom tema nasce do encontro entre um problema real, o que a equipe deseja aprender e o que pode ser concluído no prazo. Comece observando situações do curso, da escola, do estágio ou da comunidade que causam dificuldade, desperdício, risco ou perda de tempo.\n\nDepois, delimite a ideia. Defina quem é afetado, onde o problema acontece e qual aspecto será estudado. Antes de decidir, verifique se existem fontes confiáveis, acesso ao público ou aos dados necessários, recursos técnicos e um professor capaz de orientar o assunto.',
        exemplo: 'Tema amplo: tecnologia na educação.\n\nTema delimitado: desenvolvimento de um sistema web para organizar o empréstimo de equipamentos do laboratório de informática de uma escola técnica. O recorte informa a solução, o público e o contexto.',
        dicas: ['Liste três problemas observados no seu cotidiano e compare viabilidade, relevância e interesse da equipe.', 'Converse com possíveis usuários antes de escolher a solução.', 'Prefira um recorte pequeno que possa ser desenvolvido, testado e documentado com qualidade.'],
        errosComuns: ['Escolher apenas uma tecnologia, sem indicar qual problema será estudado.', 'Copiar o tema de outro trabalho sem considerar o contexto local.', 'Assumir um escopo maior que o tempo e os recursos disponíveis.'],
        materialUrl: '/public/materiais/modelo-projeto-tcc.md'
    },
    {
        ordem: 2,
        titulo: 'Como identificar e definir um problema',
        explicacao: 'O problema de pesquisa é uma pergunta clara que orienta todo o trabalho. Ele descreve algo que ainda precisa ser compreendido, melhorado ou solucionado. Para encontrá-lo, investigue a situação atual: quem é afetado, com que frequência, quais consequências existem e que evidências confirmam a dificuldade.\n\nEscreva a pergunta sem antecipar que a solução escolhida dará certo. Um problema bem definido pode ser investigado e respondido pelos resultados do TCC. Valide a pergunta com usuários, documentos, observação ou dados iniciais.',
        exemplo: 'Situação observada: equipamentos são emprestados por anotações em papel, que ficam incompletas.\n\nProblema: como um sistema web pode melhorar o registro e o acompanhamento dos empréstimos de equipamentos no laboratório de informática da instituição?',
        dicas: ['Use perguntas iniciadas por “como”, “de que forma” ou “em que medida”.', 'Registre evidências iniciais, como entrevistas, relatórios ou observações.', 'Confirme se a pergunta pode ser respondida dentro do escopo do projeto.'],
        errosComuns: ['Formular uma pergunta que só admite “sim” ou “não”.', 'Confundir problema de pesquisa com falta de uma tecnologia específica.', 'Usar afirmações vagas sem público, contexto ou consequência.'],
        materialUrl: '/public/materiais/modelo-projeto-tcc.md'
    },
    {
        ordem: 3,
        titulo: 'Como criar o objetivo geral',
        explicacao: 'O objetivo geral declara o principal resultado que o trabalho pretende alcançar. Ele deve responder diretamente ao problema de pesquisa e começar com um verbo no infinitivo, como desenvolver, analisar, avaliar, propor, comparar ou implementar.\n\nInclua o que será feito, para quem ou onde e com qual finalidade. O objetivo não é uma lista de tarefas nem uma promessa impossível de comprovar. Ao final do TCC, a conclusão deve informar claramente se ele foi atingido.',
        exemplo: 'Desenvolver e avaliar um sistema web para registrar e acompanhar o empréstimo de equipamentos do laboratório de informática, a fim de reduzir inconsistências e facilitar o controle pelos responsáveis.',
        dicas: ['Use apenas um verbo principal para manter o foco.', 'Confira se o objetivo responde à pergunta do problema.', 'Escolha um resultado que possa ser demonstrado por evidências.'],
        errosComuns: ['Usar verbos vagos, como “conhecer” ou “entender”, sem indicar resultado observável.', 'Inserir vários projetos diferentes no mesmo objetivo.', 'Descrever atividades como pesquisar, reunir e escrever em vez do resultado final.'],
        materialUrl: '/public/materiais/modelo-projeto-tcc.md'
    },
    {
        ordem: 4,
        titulo: 'Como criar objetivos específicos',
        explicacao: 'Os objetivos específicos dividem o objetivo geral em resultados menores e verificáveis. Eles formam uma sequência lógica: compreender o contexto, definir requisitos ou critérios, produzir a solução e avaliar o que foi desenvolvido. Em geral, três a cinco objetivos são suficientes para um TCC técnico.\n\nCada objetivo deve contribuir para o objetivo geral e aparecer depois na metodologia, nos resultados e na conclusão. Use verbos adequados ao tipo de pesquisa e evite transformar ferramentas ou reuniões em objetivos científicos.',
        exemplo: '1. Identificar as dificuldades do processo atual de empréstimo.\n2. Levantar os requisitos do sistema com os responsáveis pelo laboratório.\n3. Implementar as funções de cadastro, empréstimo e devolução.\n4. Avaliar a usabilidade e a consistência dos registros em um teste com usuários.',
        dicas: ['Organize os objetivos na ordem em que serão executados.', 'Associe cada objetivo a uma forma de verificação.', 'Revise os objetivos sempre que o escopo do projeto mudar.'],
        errosComuns: ['Criar objetivos que não ajudam a alcançar o objetivo geral.', 'Confundir cronograma de tarefas com objetivos específicos.', 'Prometer impactos que não serão medidos no trabalho.'],
        materialUrl: '/public/materiais/modelo-projeto-tcc.md'
    },
    {
        ordem: 5,
        titulo: 'Como escrever a justificativa',
        explicacao: 'A justificativa explica por que o trabalho merece ser realizado. Apresente a relevância do problema para o público envolvido, as consequências da situação atual e a contribuição técnica, social, acadêmica ou institucional esperada. Sempre que possível, sustente a importância com dados e fontes.\n\nDiferencie a justificativa da descrição da solução: ela deve mostrar a necessidade da pesquisa, e não apenas elogiar o produto que será criado. Também indique por que o projeto é viável para a equipe, considerando conhecimentos, acesso e recursos.',
        exemplo: 'Registros incompletos dificultam localizar equipamentos e responsabilizar empréstimos. Centralizar essas informações pode dar rastreabilidade ao laboratório e reduzir o tempo gasto em conferências. O projeto é viável porque a equipe tem acesso ao setor, aos responsáveis e às tecnologias necessárias para construir e avaliar o protótipo.',
        dicas: ['Responda: quem se beneficia, qual impacto é esperado e por que pesquisar agora?', 'Use números ou evidências quando estiverem disponíveis.', 'Explique a contribuição sem garantir resultados antes da avaliação.'],
        errosComuns: ['Justificar apenas com interesse pessoal da equipe.', 'Fazer afirmações de impacto sem fonte ou método de avaliação.', 'Repetir o problema e os objetivos com outras palavras.'],
        materialUrl: '/public/materiais/modelo-projeto-tcc.md'
    },
    {
        ordem: 6,
        titulo: 'Como definir a metodologia',
        explicacao: 'A metodologia descreve como o trabalho será realizado de modo que outra pessoa consiga compreender e avaliar o processo. Informe a natureza da pesquisa, participantes ou fontes de dados, instrumentos de coleta, etapas de desenvolvimento, critérios de análise e cuidados éticos.\n\nEm projetos técnicos, explique também como requisitos serão levantados, qual processo de desenvolvimento será usado, quais tecnologias foram escolhidas e como a solução será testada. Relacione cada procedimento a um objetivo específico e registre mudanças ocorridas durante a execução.',
        exemplo: 'A equipe fará uma pesquisa aplicada e descritiva. Primeiro, realizará entrevista semiestruturada com os responsáveis pelo laboratório e analisará os registros atuais. Em seguida, organizará requisitos, construirá protótipos e desenvolverá o sistema em ciclos curtos. A avaliação usará tarefas de uso, observação e questionário, com resultados apresentados por indicadores e comentários dos participantes.',
        dicas: ['Explique quem, onde, quando, como e com quais critérios cada etapa ocorrerá.', 'Peça autorização e preserve dados pessoais dos participantes.', 'Planeje os testes antes de terminar o produto.'],
        errosComuns: ['Listar tecnologias sem explicar o método de pesquisa.', 'Dizer apenas que foi feita uma “pesquisa na internet”.', 'Escolher métricas depois de observar os resultados.'],
        materialUrl: '/public/materiais/modelo-projeto-tcc.md'
    },
    {
        ordem: 7,
        titulo: 'Como pesquisar fontes confiáveis',
        explicacao: 'Fontes confiáveis têm autoria identificada, relação direta com o tema, método ou critérios claros e publicação adequada ao assunto. Comece pelas palavras-chave do problema e combine sinônimos em bases acadêmicas, bibliotecas, repositórios institucionais, normas técnicas e sites oficiais.\n\nAvalie cada resultado antes de usá-lo: autoria, instituição responsável, data, referências apresentadas e coerência com outras fontes. Artigos científicos, livros, dissertações, legislação e documentação oficial têm finalidades diferentes; escolha a fonte que melhor sustenta cada afirmação.',
        exemplo: 'Para pesquisar controle de patrimônio e usabilidade, a equipe combina termos como “sistema de empréstimo”, “gestão de equipamentos”, “usabilidade” e “SUS usability scale”. Depois registra autor, ano, base, link, ideia principal e relação com o projeto em uma ficha de leitura.',
        dicas: ['Use aspas para expressões exatas e operadores AND/OR para combinar termos.', 'Salve os dados bibliográficos no momento em que encontrar a fonte.', 'Compare autores e procure a publicação original de uma informação.'],
        errosComuns: ['Usar blogs sem autoria como base de conceitos importantes.', 'Citar uma fonte que não foi lida integralmente.', 'Escolher apenas os primeiros resultados de um buscador comum.'],
        materialUrl: '/public/materiais/ficha-avaliacao-fontes.md'
    },
    {
        ordem: 8,
        titulo: 'Como fazer citações e referências',
        explicacao: 'Citar é indicar de onde veio uma ideia, dado, imagem ou trecho usado no trabalho. Na citação indireta, explique a ideia com suas próprias palavras e informe a fonte. Na direta, reproduza um trecho curto e necessário seguindo as regras de formatação adotadas pela instituição. Em ambos os casos, o leitor precisa localizar a obra na lista de referências.\n\nMantenha um padrão único, de acordo com o manual institucional e as normas vigentes exigidas pelo curso. Toda obra citada no texto deve aparecer nas referências, e toda referência listada deve ter sido realmente usada. Citações não substituem a análise da equipe.',
        exemplo: 'Durante a leitura, registre: autores, título, edição, local, editora ou periódico, ano, páginas, DOI ou endereço e data de acesso quando aplicável. Ao redigir, associe imediatamente a fonte à afirmação para evitar referências perdidas.',
        dicas: ['Consulte o manual atualizado da instituição antes de formatar.', 'Use um gerenciador de referências, mas confira os dados importados.', 'Prefira paráfrases fiéis e reserve citações diretas para trechos indispensáveis.'],
        errosComuns: ['Copiar texto sem indicar autoria, o que caracteriza plágio.', 'Referenciar páginas de busca em vez da publicação original.', 'Misturar padrões de citação e deixar obras sem correspondência nas referências.'],
        materialUrl: '/public/materiais/ficha-avaliacao-fontes.md'
    },
    {
        ordem: 9,
        titulo: 'Estrutura e formatação do TCC',
        explicacao: 'A estrutura normalmente reúne elementos pré-textuais, textuais e pós-textuais. Capa, folha de rosto, resumo, sumário, introdução, referencial, metodologia, resultados, conclusão, referências e apêndices têm funções distintas. Use o modelo e o manual da instituição, pois a ordem e os itens obrigatórios podem variar.\n\nA introdução apresenta contexto, problema, objetivos e justificativa. O desenvolvimento fundamenta as decisões, descreve o método e mostra os resultados. A conclusão responde ao problema e aos objetivos, reconhece limitações e sugere trabalhos futuros. A formatação deve ser consistente em títulos, fontes, margens, figuras, tabelas, legendas e numeração.',
        exemplo: 'Antes de escrever, crie um esqueleto com os capítulos e indique em qual seção cada objetivo específico será demonstrado. Ao inserir uma figura do protótipo, inclua número, título, fonte e uma explicação no texto; a imagem nunca deve aparecer sem ser discutida.',
        dicas: ['Use estilos do editor de texto para gerar o sumário automaticamente.', 'Numere e mencione todas as figuras e tabelas no corpo do texto.', 'Faça uma revisão separada de conteúdo, referências e formatação.'],
        errosComuns: ['Deixar a formatação inteira para o dia da entrega.', 'Apresentar resultados sem relacioná-los aos objetivos.', 'Inserir imagens ilegíveis, sem fonte ou sem explicação.'],
        materialUrl: '/public/materiais/modelo-projeto-tcc.md'
    },
    {
        ordem: 10,
        titulo: 'Como preparar a apresentação',
        explicacao: 'A apresentação é uma síntese argumentativa, não a leitura do relatório. Organize a narrativa em problema, relevância, objetivo, método, solução, principais resultados e conclusão. Distribua o tempo dando prioridade ao que a equipe fez e descobriu.\n\nUse slides com pouco texto, bom contraste, imagens legíveis e uma ideia principal por tela. Ensaiem com cronômetro e definam a participação de cada integrante. Preparem respostas sobre escolhas metodológicas, limitações, resultados e possíveis melhorias.',
        exemplo: 'Em uma apresentação de 15 minutos: 2 minutos para contexto e problema; 1 para objetivos; 2 para metodologia; 5 para solução ou demonstração; 3 para resultados; 1 para conclusão; 1 minuto de margem. O tempo real deve seguir as regras da banca.',
        dicas: ['Teste antecipadamente arquivo, fontes, vídeo, áudio, internet e plano alternativo.', 'Mostre somente funcionalidades estáveis durante a demonstração.', 'Treine respostas curtas baseadas nas evidências do trabalho.'],
        errosComuns: ['Ler parágrafos dos slides de costas para a banca.', 'Gastar quase todo o tempo com teoria e apressar resultados.', 'Depender de internet ou dados externos sem alternativa.'],
        materialUrl: '/public/materiais/roteiro-apresentacao.md'
    },
    {
        ordem: 11,
        titulo: 'Checklist para a entrega final',
        explicacao: 'A revisão final confirma conteúdo, ética, autorização, arquivos e prazos. Compare problema, objetivos, metodologia, resultados e conclusão para verificar se formam uma linha coerente. Confirme que as correções do orientador foram tratadas e que não restam comentários ou marcações do editor.\n\nGere o PDF e revise o próprio arquivo entregue: sumário, links, páginas, imagens, fontes e tamanho. Confira nome do arquivo, formulário de autorização, dados dos autores e forma de envio. Guarde uma cópia do documento, anexos, código e materiais de apresentação.',
        exemplo: 'Faça três passagens: conteúdo e coerência; linguagem, citações e referências; formatação e arquivo final. Depois, outra pessoa abre o PDF em um dispositivo diferente e verifica páginas escolhidas ao acaso, sumário, figuras e links.',
        dicas: ['Conclua a versão final antes do prazo para ter tempo de corrigir o PDF.', 'Use o checklist junto com as regras oficiais do curso.', 'Confirme o recebimento do arquivo pela instituição.'],
        errosComuns: ['Enviar um arquivo diferente da versão aprovada.', 'Esquecer termos de autorização ou anexos obrigatórios.', 'Confiar apenas na visualização do editor sem revisar o PDF gerado.'],
        materialUrl: '/public/materiais/checklist-entrega-final.md'
    }
];

export default modulosTcc;
