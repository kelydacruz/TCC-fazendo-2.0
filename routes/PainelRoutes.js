import express from 'express';
const router = express.Router();

// Funcionalidade exclusiva do AcervoTCC: painéis por perfil e área de favoritos.
import PainelController from '../controllers/PainelController.js'
import { autenticado } from '../middlewares/autorizacao.js'
import { assinc } from '../middlewares/erros.js'
const controle = new PainelController();
const caminhobase = 'painel'

router.get('/' + caminhobase, autenticado, assinc(controle.index))
router.get('/favoritos', autenticado, assinc(controle.favoritos))
router.post('/tccs/:id/favorito', autenticado, assinc(controle.favoritoTcc))

export default router
