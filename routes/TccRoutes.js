import express from 'express';
const router = express.Router();

import TccController from '../controllers/TccController.js'
// Funcionalidade exclusiva do AcervoTCC: permissões, upload seguro e fluxo de avaliação/publicação.
import { autenticado, perfisPermitidos } from '../middlewares/autorizacao.js'
import { assinc } from '../middlewares/erros.js'
import { uploadTcc } from '../middlewares/upload.js'
import { csrfUpload } from '../middlewares/csrf.js'
const controle = new TccController();
const caminhobase = 'tcc/'

router.get('/tccs', assinc(controle.catalogo));
router.get('/tccs/:id', assinc(controle.detalhes));
router.get('/tccs/:id/capa', assinc(controle.capa));
router.get('/tccs/:id/pdf', assinc(controle.pdf));
router.get('/tccs/:id/download', assinc(controle.download));

router.get(
    '/' + caminhobase + 'add',
    autenticado,
    perfisPermitidos('aluno'),
    assinc(controle.openAdd)
);
router.post(
    '/' + caminhobase + 'add',
    autenticado,
    perfisPermitidos('aluno'),
    uploadTcc,
    csrfUpload,
    assinc(controle.add)
);
router.get('/' + caminhobase + 'lst', autenticado, assinc(controle.list))
router.get('/' + caminhobase + 'edt/:id', autenticado, assinc(controle.openEdt))
router.post(
    '/' + caminhobase + 'edt/:id',
    autenticado,
    perfisPermitidos('aluno'),
    uploadTcc,
    csrfUpload,
    assinc(controle.edt)
);
router.post(
    '/' + caminhobase + 'revisar/:id',
    autenticado,
    perfisPermitidos('professor', 'administrador'),
    assinc(controle.revisar)
);
router.post('/' + caminhobase + 'del/:id', autenticado, assinc(controle.del))

export default router
