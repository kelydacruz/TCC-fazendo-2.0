import express from 'express';
const router = express.Router();

import SiteController from '../controllers/SiteController.js'
const controle = new SiteController();

router.get('/', controle.home)
router.get('/sobre', controle.sobre)
router.get('/privacidade', controle.privacidade)

export default router
