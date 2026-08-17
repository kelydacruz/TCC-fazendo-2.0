import 'dotenv/config';
import app from './app.js';
import { conectarBanco } from './config/conexao.js';

// Funcionalidade exclusiva do AcervoTCC: conecta o banco antes de atender pela Vercel.
await conectarBanco();

export default app;
