import express from 'express';
const router = express.Router();

// Funcionalidade exclusiva do AcervoTCC: autenticação institucional e limitação de tentativas.
import rateLimit from 'express-rate-limit';
import AuthController from '../controllers/AuthController.js'
import { assinc } from '../middlewares/erros.js'
import { visitante } from '../middlewares/autorizacao.js'
const controle = new AuthController();
const limite = rateLimit({ windowMs:15*60*1000, limit:20, standardHeaders:true, legacyHeaders:false });

router.get('/entrar', visitante, controle.openLogin)
router.post('/entrar', visitante, limite, assinc(controle.entrar))
router.get('/cadastro', visitante, controle.openCadastro)
router.post('/cadastro', visitante, limite, assinc(controle.cadastrar))
router.get('/confirmar-email/:token', assinc(controle.confirmarEmail))
router.get('/recuperar-senha', visitante, controle.openRecuperar)
router.post('/recuperar-senha', visitante, limite, assinc(controle.solicitarRecuperacao))
router.get('/nova-senha/:token', visitante, assinc(controle.openNovaSenha))
router.post('/nova-senha/:token', visitante, limite, assinc(controle.novaSenha))
router.post('/dev/entrar/:perfil', visitante, limite, assinc(controle.entrarDesenvolvimento))
router.post('/sair', controle.sair)

export default router
