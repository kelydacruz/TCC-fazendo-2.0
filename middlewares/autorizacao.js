export function autenticado(req, res, next) {
  if (req.session?.usuario) return next();
  req.session.retorno = req.originalUrl;
  req.flash('erro', 'Entre na sua conta para continuar.');
  return res.redirect('/entrar');
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
