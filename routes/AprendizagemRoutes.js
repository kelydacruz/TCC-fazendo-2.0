import express from 'express';
import AprendizagemController from '../controllers/AprendizagemController.js';
import { autenticado } from '../middlewares/autorizacao.js';
import { assinc } from '../middlewares/erros.js';

const router = express.Router();
const controle = new AprendizagemController();
const caminhoBase = 'aprender';

router.get('/' + caminhoBase, assinc(controle.list));
router.get('/' + caminhoBase + '/:id', assinc(controle.detalhes));
router.post(
  '/' + caminhoBase + '/:id/progresso',
  autenticado,
  assinc(controle.progresso)
);

export default router;
