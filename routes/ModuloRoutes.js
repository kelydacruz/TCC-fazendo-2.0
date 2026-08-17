import express from 'express';
const router = express.Router();

// Funcionalidade exclusiva do AcervoTCC: administração da trilha de aprendizagem.
import ModuloController from '../controllers/ModuloController.js'
import { autenticado, perfisPermitidos } from '../middlewares/autorizacao.js'
import { assinc } from '../middlewares/erros.js'
const controle = new ModuloController();
const caminhobase = 'admin/modulos'

router.use('/admin', autenticado, perfisPermitidos('administrador'));
router.get('/' + caminhobase, assinc(controle.list))
router.post('/' + caminhobase, assinc(controle.add))
router.post('/' + caminhobase + '/:id', assinc(controle.edt))
router.post('/' + caminhobase + '/:id/excluir', assinc(controle.del))

export default router
