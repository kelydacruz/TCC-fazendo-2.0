import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Usuario from '../models/usuario.js';
import { enviarEmail } from '../config/email.js';
import Configuracao from '../models/configuracao.js';

export default class AuthController {
  openLogin(req, res) { res.render('auth/entrar', { title: 'Entrar' }); }
  openCadastro(req, res) { res.render('auth/cadastro', { title: 'Criar conta' }); }
  openRecuperar(req, res) { res.render('auth/recuperar', { title: 'Recuperar senha' }); }

  async cadastrar(req, res) {
    const config = await Configuracao.findOne({ chave:'geral' });
    if (config && !config.permitirCadastro) throw new Error('Novos cadastros estão temporariamente suspensos.');
    const { nome, email, senha, confirmarSenha, perfil } = req.body;
    if (!nome || !email || !senha || senha.length < 8) throw new Error('Preencha os dados e use uma senha com pelo menos 8 caracteres.');
    if (senha !== confirmarSenha) throw new Error('As senhas não coincidem.');
    if (!['aluno', 'professor'].includes(perfil)) throw new Error('Perfil inválido.');
    if (await Usuario.exists({ email: email.toLowerCase() })) throw new Error('Este e-mail já está cadastrado.');
    const tokenEmail = crypto.randomBytes(24).toString('hex');
    const usuario = await Usuario.create({ nome, email, senha: await bcrypt.hash(senha, 12), perfil, tokenEmail });
    const link = `${process.env.BASE_URL || 'http://localhost:3001'}/confirmar-email/${tokenEmail}`;
    await enviarEmail({ para:usuario.email, assunto:'Confirme sua conta no AcervoTCC', html:`<p>Olá, ${usuario.nome}.</p><p><a href="${link}">Confirme seu e-mail</a> para continuar.</p>`, linkDesenvolvimento:link });
    req.flash('sucesso', 'Conta criada. Confirme o e-mail e aguarde aprovação.');
    return res.redirect('/entrar');
  }

  async entrar(req, res) {
    const usuario = await Usuario.findOne({ email: String(req.body.email).toLowerCase() }).select('+senha');
    if (!usuario || !await bcrypt.compare(req.body.senha || '', usuario.senha)) throw new Error('E-mail ou senha inválidos.');
    if (!usuario.ativo) throw new Error('Esta conta está desativada.');
    if (!usuario.emailConfirmado) throw new Error('Confirme seu e-mail antes de entrar.');
    if (!usuario.aprovado) throw new Error('Sua conta ainda aguarda aprovação.');
    const retorno = req.session.retorno || '/painel';
    return req.session.regenerate(erro => {
      if (erro) return res.redirect('/entrar');
      req.session.usuario = { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil };
      req.session.save(() => res.redirect(retorno));
    });
  }

  async confirmarEmail(req, res) {
    const usuario = await Usuario.findOneAndUpdate({ tokenEmail: req.params.token }, { emailConfirmado: true, $unset: { tokenEmail: 1 } });
    req.flash(usuario ? 'sucesso' : 'erro', usuario ? 'E-mail confirmado. Aguarde a aprovação da conta.' : 'Link de confirmação inválido.');
    res.redirect('/entrar');
  }

  async solicitarRecuperacao(req, res) {
    const token = crypto.randomBytes(24).toString('hex');
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const usuario = await Usuario.findOneAndUpdate({ email: String(req.body.email).toLowerCase() }, { tokenRecuperacao: hash, expiraRecuperacao: Date.now() + 3600000 });
    if (usuario) { const link=`${process.env.BASE_URL || 'http://localhost:3001'}/nova-senha/${token}`; await enviarEmail({para:usuario.email,assunto:'Recupere sua senha do AcervoTCC',html:`<p><a href="${link}">Defina uma nova senha</a>. O link expira em uma hora.</p>`,linkDesenvolvimento:link}); }
    req.flash('sucesso', 'Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.');
    res.redirect('/entrar');
  }

  async openNovaSenha(req, res) {
    const hash = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const usuario = await Usuario.exists({ tokenRecuperacao: hash, expiraRecuperacao: { $gt: new Date() } });
    if (!usuario) throw new Error('Link de recuperação inválido ou expirado.');
    res.render('auth/nova-senha', { title: 'Nova senha', token: req.params.token });
  }

  async novaSenha(req, res) {
    if (!req.body.senha || req.body.senha.length < 8 || req.body.senha !== req.body.confirmarSenha) throw new Error('Informe duas senhas iguais com pelo menos 8 caracteres.');
    const hash = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const usuario = await Usuario.findOne({ tokenRecuperacao: hash, expiraRecuperacao: { $gt: new Date() } }).select('+tokenRecuperacao +expiraRecuperacao');
    if (!usuario) throw new Error('Link de recuperação inválido ou expirado.');
    usuario.senha = await bcrypt.hash(req.body.senha, 12);
    usuario.tokenRecuperacao = undefined;
    usuario.expiraRecuperacao = undefined;
    await usuario.save();
    req.flash('sucesso', 'Senha alterada. Você já pode entrar.');
    res.redirect('/entrar');
  }

  sair(req, res) { req.session.destroy(() => res.redirect('/')); }
}
