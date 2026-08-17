import express from 'express';
const router = express.Router();

// Funcionalidade exclusiva do AcervoTCC: configurações institucionais administráveis.
import ConfiguracaoController from '../controllers/ConfiguracaoController.js'
import { autenticado, perfisPermitidos } from '../middlewares/autorizacao.js'
import { assinc } from '../middlewares/erros.js'
const controle = new ConfiguracaoController();
const caminhobase = 'admin/configuracao'

router.use('/admin', autenticado, perfisPermitidos('administrador'));
router.get('/' + caminhobase, assinc(controle.openEdt))
router.post('/' + caminhobase, assinc(controle.edt))

export default router
