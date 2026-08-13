import express from 'express';
import ConfiguracaoController from '../controllers/ConfiguracaoController.js';
import { autenticado, perfisPermitidos } from '../middlewares/autorizacao.js';
import { assinc } from '../middlewares/erros.js';

const router = express.Router();
const controle = new ConfiguracaoController();
const caminhoBase = 'admin/configuracao';

router.use('/admin', autenticado, perfisPermitidos('administrador'));
router.get('/' + caminhoBase, assinc(controle.openEdt));
router.post('/' + caminhoBase, assinc(controle.edt));

export default router;
