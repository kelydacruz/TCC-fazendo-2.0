import express from 'express';
const router = express.Router();

// Funcionalidade exclusiva do AcervoTCC: trilha de aprendizagem e progresso do aluno.
import AprendizagemController from '../controllers/AprendizagemController.js'
import { autenticado } from '../middlewares/autorizacao.js'
import { assinc } from '../middlewares/erros.js'
const controle = new AprendizagemController();
const caminhobase = 'aprender'

router.get('/' + caminhobase, assinc(controle.list))
router.get('/' + caminhobase + '/:id', assinc(controle.detalhes))
router.post(
    '/' + caminhobase + '/:id/progresso',
    autenticado,
    assinc(controle.progresso)
)

export default router
