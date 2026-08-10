import Tcc from '../models/tcc.js';
import Curso from '../models/curso.js';
import Ideia from '../models/ideia.js';
import Configuracao from '../models/configuracao.js';
import { bancoDisponivel } from '../config/conexao.js';
import { cursos, tccs } from '../data/mock.js';

export default class SiteController {
  home = async(req, res) => {
    if (!bancoDisponivel()) return res.render('home', { title:'Início', tccs, cursos });
    const [recentes,maisAcessados,cursosDb,totalTcc,totalViews,totalDownloads,totalIdeias] = await Promise.all([
      Tcc.find({status:'Publicado'}).select('-pdf.dados -capa.dados').populate('curso orientador').sort({publicadoEm:-1}).limit(3),
      Tcc.find({status:'Publicado'}).select('-pdf.dados -capa.dados').populate('curso orientador').sort({visualizacoes:-1}).limit(3),
      Curso.find({ativo:true}), Tcc.countDocuments({status:'Publicado'}),
      Tcc.aggregate([{$match:{status:'Publicado'}},{$group:{_id:null,total:{$sum:'$visualizacoes'}}}]),
      Tcc.aggregate([{$match:{status:'Publicado'}},{$group:{_id:null,total:{$sum:'$downloads'}}}]), Ideia.countDocuments({status:{$ne:'Arquivada'}})
    ]);
    res.render('home-db',{title:'Início',recentes,maisAcessados,cursos:cursosDb,stats:{tccs:totalTcc,views:totalViews[0]?.total||0,downloads:totalDownloads[0]?.total||0,ideias:totalIdeias}});
  };
  sobre = async(req,res)=>{const config=bancoDisponivel()?await Configuracao.findOne({chave:'geral'}):null;res.render('institucional/sobre',{title:'Sobre a plataforma',config});};
  privacidade = async(req,res)=>{const config=bancoDisponivel()?await Configuracao.findOne({chave:'geral'}):null;res.render('institucional/privacidade',{title:'Política de privacidade',config});};
}
