import express from 'express';
const router = express.Router();

// Funcionalidade exclusiva do AcervoTCC: análise administrativa de conteúdo denunciado.
import DenunciaController from '../controllers/DenunciaController.js'
import { autenticado, perfisPermitidos } from '../middlewares/autorizacao.js'
import { assinc } from '../middlewares/erros.js'
const controle = new DenunciaController();
const caminhobase = 'admin/denuncias'

router.use('/admin', autenticado, perfisPermitidos('administrador'));
router.get('/' + caminhobase, assinc(controle.list))
router.post('/' + caminhobase + '/:id', assinc(controle.edt))
router.post('/' + caminhobase + '/:id/excluir', assinc(controle.del))

export default router
