import Tcc from '../models/tcc.js';
import Curso from '../models/curso.js';
import Configuracao from '../models/configuracao.js';
import { bancoDisponivel } from '../config/conexao.js';

export default class SiteController {
  home = async(req, res) => {
    res.set('Cache-Control','no-store');
    if (!bancoDisponivel()) return res.render('home-db', {
      title:'Início', recentes:[], maisAcessados:[], cursos:[], anos:[], areas:[],
      stats:{tccs:0,views:0,downloads:0}
    });
    const [recentes,maisAcessados,cursosDb,anos,areas,totalTcc,totalViews,totalDownloads] = await Promise.all([
      Tcc.find({status:'Publicado'}).select('-pdf.dados -capa.dados').populate('curso orientador').sort({publicadoEm:-1}).limit(3),
      Tcc.find({status:'Publicado'}).select('-pdf.dados -capa.dados').populate('curso orientador').sort({visualizacoes:-1}).limit(3),
      Curso.find({ativo:true}), Tcc.distinct('ano',{status:'Publicado'}), Tcc.distinct('area',{status:'Publicado'}), Tcc.countDocuments({status:'Publicado'}),
      Tcc.aggregate([{$match:{status:'Publicado'}},{$group:{_id:null,total:{$sum:'$visualizacoes'}}}]),
      Tcc.aggregate([{$match:{status:'Publicado'}},{$group:{_id:null,total:{$sum:'$downloads'}}}])
    ]);
    res.render('home-db',{title:'Início',recentes,maisAcessados,cursos:cursosDb,anos:anos.sort((a,b)=>b-a),areas:areas.sort(),stats:{tccs:totalTcc,views:totalViews[0]?.total||0,downloads:totalDownloads[0]?.total||0}});
  };
  sobre = async(req,res)=>{const config=bancoDisponivel()?await Configuracao.findOne({chave:'geral'}):null;res.render('institucional/sobre',{title:'Sobre a plataforma',config});};
  privacidade = async(req,res)=>{const config=bancoDisponivel()?await Configuracao.findOne({chave:'geral'}):null;res.render('institucional/privacidade',{title:'Política de privacidade',config});};
}
