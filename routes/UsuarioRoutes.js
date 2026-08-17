import express from 'express';
const router = express.Router();

// Funcionalidade exclusiva do AcervoTCC: aprovação de contas e vínculos acadêmicos.
import UsuarioController from '../controllers/UsuarioController.js'
import { autenticado, perfisPermitidos } from '../middlewares/autorizacao.js'
import { assinc } from '../middlewares/erros.js'
const controle = new UsuarioController();
const caminhobase = 'admin/usuarios'

router.use('/admin', autenticado, perfisPermitidos('administrador'));
router.get('/' + caminhobase, assinc(controle.list))
router.post('/' + caminhobase + '/:id', assinc(controle.edt))
router.post('/' + caminhobase + '/:id/excluir', assinc(controle.del))

export default router
