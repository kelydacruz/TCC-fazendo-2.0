import express from 'express';
import SiteController from '../controllers/SiteController.js';
const router = express.Router();
const site = new SiteController();
router.get('/', site.home);
router.get('/sobre', site.sobre);
router.get('/privacidade', site.privacidade);
export default router;
