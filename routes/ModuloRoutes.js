import express from 'express';
import ModuloController from '../controllers/ModuloController.js';
import { autenticado, perfisPermitidos } from '../middlewares/autorizacao.js';
import { assinc } from '../middlewares/erros.js';

const router = express.Router();
const controle = new ModuloController();
const caminhoBase = 'admin/modulos';

router.use('/admin', autenticado, perfisPermitidos('administrador'));
router.get('/' + caminhoBase, assinc(controle.list));
router.post('/' + caminhoBase, assinc(controle.add));
router.post('/' + caminhoBase + '/:id', assinc(controle.edt));
router.post('/' + caminhoBase + '/:id/excluir', assinc(controle.del));

export default router;
