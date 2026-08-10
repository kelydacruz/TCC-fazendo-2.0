import 'dotenv/config';
import app from './app.js';
import { conectarBanco } from './config/conexao.js';
const port = process.env.PORT || 3001;
await conectarBanco();
app.listen(port, () => console.log(`AcervoTCC disponível em http://localhost:${port}`));
