import express from 'express';
import CursoController from '../controllers/CursoController.js';
import { autenticado, perfisPermitidos } from '../middlewares/autorizacao.js';
import { assinc } from '../middlewares/erros.js';

const router = express.Router();
const controle = new CursoController();
const caminhoBase = 'admin/cursos';

router.use('/admin', autenticado, perfisPermitidos('administrador'));
router.get('/' + caminhoBase, assinc(controle.list));
router.post('/' + caminhoBase, assinc(controle.add));
router.post('/' + caminhoBase + '/:id', assinc(controle.edt));
router.post('/' + caminhoBase + '/:id/excluir', assinc(controle.del));

export default router;
