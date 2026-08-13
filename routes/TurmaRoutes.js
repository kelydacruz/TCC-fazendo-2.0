import express from 'express';
import TurmaController from '../controllers/TurmaController.js';
import { autenticado, perfisPermitidos } from '../middlewares/autorizacao.js';
import { assinc } from '../middlewares/erros.js';

const router = express.Router();
const controle = new TurmaController();
const caminhoBase = 'admin/turmas';

router.use('/admin', autenticado, perfisPermitidos('administrador'));
router.post('/' + caminhoBase, assinc(controle.add));
router.post('/' + caminhoBase + '/:id', assinc(controle.edt));
router.post('/' + caminhoBase + '/:id/excluir', assinc(controle.del));

export default router;
