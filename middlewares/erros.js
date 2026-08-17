// Funcionalidade exclusiva do AcervoTCC: tratamento centralizado de erros assíncronos.
export const assinc = funcao => (req, res, next) => Promise.resolve(funcao(req, res, next)).catch(next);

export function naoEncontrado(req, res) {
    return res.status(404).render('404', { title: 'Página não encontrada' });
}

export function tratarErro(erro, req, res, next) {
    console.error(erro);
    if (res.headersSent) return next(erro);
    const status = ['ValidationError','CastError'].includes(erro.name) ? 400 : (erro.status || 500);
    const mensagem = status === 500 ? 'Não foi possível concluir a operação.' : erro.message;
    if (req.accepts('html')) {
        req.flash('erro', mensagem);
        return res.status(status).redirect(req.get('referer') || '/');
    }
    return res.status(status).json({ erro: mensagem });
}
