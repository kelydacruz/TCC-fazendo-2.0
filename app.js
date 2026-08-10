import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import helmet from 'helmet';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/route.js';
import AuthRoutes from './routes/AuthRoutes.js';
import TccRoutes from './routes/TccRoutes.js';
import IdeiaRoutes from './routes/IdeiaRoutes.js';
import AprendizagemRoutes from './routes/AprendizagemRoutes.js';
import PainelRoutes from './routes/PainelRoutes.js';
import AdminRoutes from './routes/AdminRoutes.js';
import { csrf } from './middlewares/csrf.js';
import { naoEncontrado, tratarErro } from './middlewares/erros.js';
import { dominiosInstitucionais, loginRapidoAtivo } from './config/dominios.js';
const app = express();
const root = dirname(fileURLToPath(import.meta.url));
if (process.env.NODE_ENV === 'production') {
  if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET é obrigatória em produção.');
  const dominios = dominiosInstitucionais();
  if (!dominios.aluno.length || !dominios.professor.length) throw new Error('Configure ALUNO_EMAIL_DOMAINS e PROFESSOR_EMAIL_DOMAINS em produção.');
}
app.set('view engine','ejs');
app.set('views',join(root,'views'));
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy:false, crossOriginEmbedderPolicy:false }));
app.use(express.urlencoded({extended:true}));
app.use('/public',express.static(join(root,'public')));
const sessao = {
  secret:process.env.SESSION_SECRET || 'desenvolvimento-altere-esta-chave',
  resave:false, saveUninitialized:false,
  cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:8*60*60*1000}
};
if (process.env.MONGODB_URI) sessao.store = MongoStore.create({mongoUrl:process.env.MONGODB_URI,collectionName:'sessoes'});
app.use(session(sessao));
app.use((req,res,next)=>{
  req.flash=(tipo,mensagem)=>{req.session.mensagens=req.session.mensagens||[];req.session.mensagens.push({tipo,mensagem});};
  res.locals.usuarioAtual=req.session.usuario||null;
  res.locals.mensagens=req.session.mensagens||[];
  delete req.session.mensagens;
  res.locals.caminhoAtual=req.path;
  res.locals.devQuickLogin=loginRapidoAtivo();
  res.locals.dominiosEmail=dominiosInstitucionais();
  next();
});
app.use(csrf);
app.use(routes);
app.use(AuthRoutes,TccRoutes,IdeiaRoutes,AprendizagemRoutes,PainelRoutes,AdminRoutes);
app.use(naoEncontrado);
app.use(tratarErro);
export default app;
