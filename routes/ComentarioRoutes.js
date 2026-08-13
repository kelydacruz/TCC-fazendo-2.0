import express from 'express';
import rateLimit from 'express-rate-limit';
import ComentarioController from '../controllers/ComentarioController.js';
import { autenticado, perfisPermitidos } from '../middlewares/autorizacao.js';
import { assinc } from '../middlewares/erros.js';

const router = express.Router();
const controle = new ComentarioController();
const limite = rateLimit({
  windowMs: 60 * 1000,
  limit: 6,
  standardHeaders: true,
  legacyHeaders: false
});

router.post(
  '/ideias/:ideiaId/comentarios',
  autenticado,
  limite,
  assinc(controle.add)
);
router.post('/comentarios/:id/excluir', autenticado, assinc(controle.del));
router.post('/comentarios/:id/denunciar', autenticado, assinc(controle.denunciar));
router.post(
  '/comentarios/:id/moderar',
  autenticado,
  perfisPermitidos('professor', 'administrador'),
  assinc(controle.moderar)
);

export default router;
