import Usuario from '../models/usuario.js';

export function autenticado(req, res, next) {
  if (!req.session?.usuario) {
    req.session.retorno = req.originalUrl;
    req.flash('erro', 'Entre na sua conta para continuar.');
    return res.redirect('/entrar');
  }
  return Usuario.findById(req.session.usuario.id).select('nome email perfil ativo aprovado').then(usuario=>{
    if(!usuario?.ativo||!usuario.aprovado){
      delete req.session.usuario;
      req.flash('erro','Sua conta está inativa ou aguarda aprovação.');
      return req.session.save(()=>res.redirect('/entrar'));
    }
    req.session.usuario={id:usuario.id,nome:usuario.nome,email:usuario.email,perfil:usuario.perfil};
    return next();
  }).catch(next);
}

export function perfisPermitidos(...perfis) {
  return (req, res, next) => {
    if (req.session?.usuario && perfis.includes(req.session.usuario.perfil)) return next();
    req.flash('erro', 'Você não possui permissão para acessar esta área.');
    return res.status(403).redirect(req.get('referer') || '/');
  };
}

export function visitante(req, res, next) {
  if (!req.session?.usuario) return next();
  return res.redirect('/painel');
}
