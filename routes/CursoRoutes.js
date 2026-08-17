import express from 'express';
const router = express.Router();

import CursoController from '../controllers/CursoController.js'
// Funcionalidade exclusiva do AcervoTCC: protege o cadastro acadêmico por perfil.
import { autenticado, perfisPermitidos } from '../middlewares/autorizacao.js'
import { assinc } from '../middlewares/erros.js'
const controle = new CursoController();
const caminhobase = 'admin/cursos'

router.use('/admin', autenticado, perfisPermitidos('administrador'));
router.get('/' + caminhobase, assinc(controle.list))
router.post('/' + caminhobase, assinc(controle.add))
router.post('/' + caminhobase + '/:id', assinc(controle.edt))
router.post('/' + caminhobase + '/:id/excluir', assinc(controle.del))

export default router
