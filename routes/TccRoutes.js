import express from 'express';
import TccController from '../controllers/TccController.js';
import { autenticado, perfisPermitidos } from '../middlewares/autorizacao.js';
import { assinc } from '../middlewares/erros.js';
import { uploadTcc } from '../middlewares/upload.js';
import { csrfUpload } from '../middlewares/csrf.js';

const router = express.Router();
const controle = new TccController();
const caminhoBase = 'tcc/';

router.get('/tccs', assinc(controle.catalogo));
router.get('/tccs/:id', assinc(controle.detalhes));
router.get('/tccs/:id/capa', assinc(controle.capa));
router.get('/tccs/:id/pdf', assinc(controle.pdf));
router.get('/tccs/:id/download', assinc(controle.download));

router.get(
  '/' + caminhoBase + 'add',
  autenticado,
  perfisPermitidos('aluno'),
  assinc(controle.openAdd)
);
router.post(
  '/' + caminhoBase + 'add',
  autenticado,
  perfisPermitidos('aluno'),
  uploadTcc,
  csrfUpload,
  assinc(controle.add)
);
router.get('/' + caminhoBase + 'lst', autenticado, assinc(controle.list));
router.get('/' + caminhoBase + 'edt/:id', autenticado, assinc(controle.openEdt));
router.post(
  '/' + caminhoBase + 'edt/:id',
  autenticado,
  perfisPermitidos('aluno'),
  uploadTcc,
  csrfUpload,
  assinc(controle.edt)
);
router.post(
  '/' + caminhoBase + 'revisar/:id',
  autenticado,
  perfisPermitidos('professor', 'administrador'),
  assinc(controle.revisar)
);
router.post('/' + caminhoBase + 'del/:id', autenticado, assinc(controle.del));

export default router;
