import express from 'express';
const router = express.Router();

import TurmaController from '../controllers/TurmaController.js'
// Funcionalidade exclusiva do AcervoTCC: protege o cadastro acadêmico por perfil.
import { autenticado, perfisPermitidos } from '../middlewares/autorizacao.js'
import { assinc } from '../middlewares/erros.js'
const controle = new TurmaController();
const caminhobase = 'admin/turmas'

router.use('/admin', autenticado, perfisPermitidos('administrador'));
router.post('/' + caminhobase, assinc(controle.add))
router.post('/' + caminhobase + '/:id', assinc(controle.edt))
router.post('/' + caminhobase + '/:id/excluir', assinc(controle.del))

export default router
