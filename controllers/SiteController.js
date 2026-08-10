import { cursos, ideias, modulos, tccs } from '../data/mock.js';

const normalize = value => String(value || '').toLocaleLowerCase('pt-BR');

export default class SiteController {
  home(req, res) { res.render('home', { title:'Início', tccs, cursos }); }

  catalogo(req, res) {
    const { q='', curso='', ano='', area='', orientador='', ordem='recentes' } = req.query;
    let resultado = tccs.filter(t => {
      const texto = normalize([t.titulo,t.resumo,t.autores.join(' '),t.orientador,t.palavras.join(' ')].join(' '));
      return (!q || texto.includes(normalize(q))) && (!curso || t.curso === curso) && (!ano || String(t.ano) === ano) && (!area || t.area === area) && (!orientador || t.orientador === orientador);
    });
    if (ordem === 'az') resultado.sort((a,b) => a.titulo.localeCompare(b.titulo));
    if (ordem === 'visualizados') resultado.sort((a,b) => b.views-a.views);
    res.render('catalogo', { title:'Acervo de TCCs', resultado, tccs, cursos, query:req.query });
  }

  detalhes(req, res) {
    const tcc = tccs.find(item => item.id === req.params.id);
    if (!tcc) return res.status(404).render('404', { title:'Trabalho não encontrado' });
    const relacionados = tccs.filter(item => item.id !== tcc.id && (item.curso === tcc.curso || item.area === tcc.area)).slice(0,3);
    res.render('detalhes', { title:tcc.titulo, tcc, relacionados });
  }

  aprender(req, res) { res.render('aprender', { title:'Aprenda a fazer seu TCC', modulos }); }
  bancoIdeias(req, res) { res.render('ideias', { title:'Banco de Ideias', ideias, cursos }); }
  painel(req, res) { res.render('painel', { title:'Meu painel', tccs, ideias }); }
}
