// Funcionalidade exclusiva do AcervoTCC: proteção dos formulários contra requisições forjadas.
import crypto from 'crypto';

export function csrf(req, res, next) {
    if (!req.session.csrf) req.session.csrf = crypto.randomBytes(24).toString('hex');
    res.locals.csrfToken = req.session.csrf;
    if (req.method !== 'POST' || req.is('multipart/form-data')) return next();
    if (tokenValido(req)) return next();
    const erro = new Error('A sessão do formulário expirou. Atualize a página e tente novamente.');
    erro.status = 403;
    return next(erro);
}

function tokenValido(req) {
    const recebido = String(req.body?._csrf || '');
    const esperado = String(req.session?.csrf || '');
    return recebido.length === esperado.length && recebido.length > 0 && crypto.timingSafeEqual(Buffer.from(recebido), Buffer.from(esperado));
}

export function csrfUpload(req, res, next) {
    if (tokenValido(req)) return next();
    const erro = new Error('A sessão do formulário expirou. Atualize a página e tente novamente.');
    erro.status = 403;
    next(erro);
}
