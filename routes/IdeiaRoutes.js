import express from 'express';
import IdeiaController from '../controllers/IdeiaController.js';
import { autenticado, perfisPermitidos } from '../middlewares/autorizacao.js';
import { assinc } from '../middlewares/erros.js';

const router = express.Router();
const controle = new IdeiaController();
const caminhoBase = 'ideias';

router.use('/' + caminhoBase, autenticado);
router.get('/' + caminhoBase, assinc(controle.list));
router.get('/' + caminhoBase + '/nova', assinc(controle.openAdd));
router.post('/' + caminhoBase + '/nova', assinc(controle.add));
router.get('/' + caminhoBase + '/:id', assinc(controle.detalhes));
router.post(
  '/' + caminhoBase + '/:id/status',
  perfisPermitidos('aluno'),
  assinc(controle.statusAluno)
);
router.get('/' + caminhoBase + '/:id/editar', assinc(controle.openEdt));
router.post('/' + caminhoBase + '/:id/editar', assinc(controle.edt));
router.post('/' + caminhoBase + '/:id/excluir', assinc(controle.del));
router.post('/' + caminhoBase + '/:id/favorito', assinc(controle.favorito));

export default router;
