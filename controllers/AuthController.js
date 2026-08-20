// Funcionalidade exclusiva do AcervoTCC: autenticação institucional, confirmação e recuperação de senha.
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Usuario from '../models/usuario.js';
import Configuracao from '../models/configuracao.js';
import { enviarEmail } from '../config/email.js';
import {
    contaDeTeste,
    loginRapidoAtivo,
    perfilDoEmail
} from '../config/dominios.js';
import { bancoDisponivel } from '../config/conexao.js';

function falha(mensagem, status = 400) {
    return Object.assign(new Error(mensagem), { status });
}

export default class AuthController{
    constructor(caminhoBase='auth/'){
        this.caminhoBase = caminhoBase;

        this.openLogin = (req, res)=>{
            res.render(this.caminhoBase + 'entrar', { title: 'Entrar' });
        };

        this.openCadastro = (req, res)=>{
            res.render(this.caminhoBase + 'cadastro', { title: 'Criar conta' });
        };

        this.openRecuperar = (req, res)=>{
            res.render(this.caminhoBase + 'recuperar', { title: 'Recuperar senha' });
        };

        this.cadastrar = async(req, res)=>{
            const config = await Configuracao.findOne({ chave: 'geral' });
            if (config && !config.permitirCadastro) {
                throw new Error('Novos cadastros estão temporariamente suspensos.');
            }

            const { nome, email, senha, confirmarSenha } = req.body;
            if (!nome || !email || !senha || senha.length < 8) {
                throw new Error(
                    'Preencha os dados e use uma senha com pelo menos 8 caracteres.'
                );
            }
            if (senha !== confirmarSenha) throw new Error('As senhas não coincidem.');

            const perfil = perfilDoEmail(email);
            if (!perfil) {
                throw new Error(
                    'Use um e-mail institucional de aluno ou professor autorizado.'
                );
            }
            if (await Usuario.exists({ email: email.toLowerCase() })) {
                throw new Error('Este e-mail já está cadastrado.');
            }

            const tokenEmail = crypto.randomBytes(24).toString('hex');
            const usuario = await Usuario.create({
                nome,
                email,
                senha: await bcrypt.hash(senha, 12),
                perfil,
                tokenEmail
            });
            const link = `${process.env.BASE_URL || 'http://localhost:3001'}/confirmar-email/${tokenEmail}`;

            await enviarEmail({
                para: usuario.email,
                assunto: 'Confirme sua conta no AcervoTCC',
                html: `<p>Olá, ${usuario.nome}.</p><p><a href="${link}">Confirme seu e-mail</a> para continuar.</p>`,
                linkDesenvolvimento: link
            });

            req.flash(
                'sucesso',
                'Conta criada. Confirme o e-mail e aguarde aprovação.'
            );
            res.redirect('/entrar');
        };

        this.entrarDesenvolvimento = async(req, res)=>{
            // Funcionalidade exclusiva do AcervoTCC: acesso rápido apenas no ambiente de desenvolvimento.
            if (!loginRapidoAtivo()) {
                return res.status(404).render('404', { title: 'Página não encontrada' });
            }
            if (!bancoDisponivel()) {
                throw new Error(
                    'Configure MONGODB_URI para usar as contas rápidas de teste.'
                );
            }

            const conta = contaDeTeste(req.params.conta);
            if (!conta) {
                return res.status(404).render('404', { title: 'Página não encontrada' });
            }

            const usuario = await Usuario.findOneAndUpdate(
                { email: conta.email },
                {
                    $set: {
                        nome: conta.nome,
                        perfil: conta.perfil,
                        aprovado: true,
                        emailConfirmado: true,
                        ativo: true
                    },
                    $setOnInsert: {
                        senha: await bcrypt.hash(
                            crypto.randomBytes(32).toString('hex'),
                            12
                        )
                    }
                },
                { upsert: true, new: true, runValidators: true }
            );

            return req.session.regenerate(erro => {
                if (erro) return res.redirect('/entrar');

                req.session.usuario = {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    perfil: usuario.perfil
                };
                req.session.save(() => res.redirect('/painel'));
            });
        };

        this.entrar = async(req, res)=>{
            const usuario = await Usuario.findOne({
                email: String(req.body.email).toLowerCase()
            }).select('+senha');
            const senhaValida = usuario
                && await bcrypt.compare(req.body.senha || '', usuario.senha);

            if (!senhaValida) throw falha('E-mail ou senha inválidos.', 401);
            if (
                usuario.perfil !== 'administrador'
                && perfilDoEmail(usuario.email) !== usuario.perfil
            ) {
                throw falha(
                    'Este e-mail não pertence mais a um domínio institucional autorizado.',
                    403
                );
            }
            if (!usuario.ativo) throw falha('Esta conta está desativada.', 403);
            if (!usuario.emailConfirmado) {
                throw falha('Confirme seu e-mail antes de entrar.', 403);
            }
            if (!usuario.aprovado) {
                throw falha('Sua conta ainda aguarda aprovação.', 403);
            }

            const retorno = req.session.retorno || '/painel';
            return req.session.regenerate(erro => {
                if (erro) return res.redirect('/entrar');

                req.session.usuario = {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    perfil: usuario.perfil
                };
                req.session.save(() => res.redirect(retorno));
            });
        };

        this.confirmarEmail = async(req, res)=>{
            const usuario = await Usuario.findOneAndUpdate(
                { tokenEmail: req.params.token },
                {
                    emailConfirmado: true,
                    $unset: { tokenEmail: 1 }
                }
            );

            req.flash(
                usuario ? 'sucesso' : 'erro',
                usuario
                    ? 'E-mail confirmado. Aguarde a aprovação da conta.'
                    : 'Link de confirmação inválido.'
            );
            res.redirect('/entrar');
        };

        this.solicitarRecuperacao = async(req, res)=>{
            const token = crypto.randomBytes(24).toString('hex');
            const hash = crypto.createHash('sha256').update(token).digest('hex');
            const usuario = await Usuario.findOneAndUpdate(
                { email: String(req.body.email).toLowerCase() },
                {
                    tokenRecuperacao: hash,
                    expiraRecuperacao: Date.now() + 3600000
                }
            );

            if (usuario) {
                const link = `${process.env.BASE_URL || 'http://localhost:3001'}/nova-senha/${token}`;
                await enviarEmail({
                    para: usuario.email,
                    assunto: 'Recupere sua senha do AcervoTCC',
                    html: `<p><a href="${link}">Defina uma nova senha</a>. O link expira em uma hora.</p>`,
                    linkDesenvolvimento: link
                });
            }

            req.flash(
                'sucesso',
                'Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.'
            );
            res.redirect('/entrar');
        };

        this.openNovaSenha = async(req, res)=>{
            const hash = crypto
                .createHash('sha256')
                .update(req.params.token)
                .digest('hex');
            const usuario = await Usuario.exists({
                tokenRecuperacao: hash,
                expiraRecuperacao: { $gt: new Date() }
            });

            if (!usuario) throw new Error('Link de recuperação inválido ou expirado.');
            res.render(this.caminhoBase + 'nova-senha', {
                title: 'Nova senha',
                token: req.params.token
            });
        };

        this.novaSenha = async(req, res)=>{
            const senhaInvalida = !req.body.senha
                || req.body.senha.length < 8
                || req.body.senha !== req.body.confirmarSenha;
            if (senhaInvalida) {
                throw new Error(
                    'Informe duas senhas iguais com pelo menos 8 caracteres.'
                );
            }

            const hash = crypto
                .createHash('sha256')
                .update(req.params.token)
                .digest('hex');
            const usuario = await Usuario.findOne({
                tokenRecuperacao: hash,
                expiraRecuperacao: { $gt: new Date() }
            }).select('+tokenRecuperacao +expiraRecuperacao');

            if (!usuario) throw new Error('Link de recuperação inválido ou expirado.');

            usuario.senha = await bcrypt.hash(req.body.senha, 12);
            usuario.tokenRecuperacao = undefined;
            usuario.expiraRecuperacao = undefined;
            await usuario.save();

            req.flash('sucesso', 'Senha alterada. Você já pode entrar.');
            res.redirect('/entrar');
        };

        this.sair = (req, res)=>{
            req.session.destroy(() => res.redirect('/'));
        };
    }
}
