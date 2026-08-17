import express from 'express';
const router = express.Router();

// Funcionalidade exclusiva do AcervoTCC: banco de ideias disponível somente para usuários autenticados.
import IdeiaController from '../controllers/IdeiaController.js'
import { autenticado, perfisPermitidos } from '../middlewares/autorizacao.js'
import { assinc } from '../middlewares/erros.js'
const controle = new IdeiaController();
const caminhobase = 'ideias'

router.use('/' + caminhobase, autenticado);
router.get('/' + caminhobase, assinc(controle.list))
router.get('/' + caminhobase + '/nova', assinc(controle.openAdd))
router.post('/' + caminhobase + '/nova', assinc(controle.add))
router.get('/' + caminhobase + '/:id', assinc(controle.detalhes))
router.post(
    '/' + caminhobase + '/:id/status',
    perfisPermitidos('aluno'),
    assinc(controle.statusAluno)
)
router.get('/' + caminhobase + '/:id/editar', assinc(controle.openEdt))
router.post('/' + caminhobase + '/:id/editar', assinc(controle.edt))
router.post('/' + caminhobase + '/:id/excluir', assinc(controle.del))
router.post('/' + caminhobase + '/:id/favorito', assinc(controle.favorito))

export default router
