// Funcionalidade exclusiva do AcervoTCC: valida tamanho e tipo dos PDFs e imagens enviados.
import multer from 'multer';

const storage = multer.memoryStorage();
const limites = { fileSize: 10 * 1024 * 1024, files: 2 };

function filtrar(req, file, callback) {
    const aceitos = file.fieldname === 'pdf'
        ? ['application/pdf']
        : ['image/jpeg', 'image/png', 'image/webp'];
    if (!aceitos.includes(file.mimetype)) return callback(new Error(`Formato inválido no campo ${file.fieldname}.`));
    callback(null, true);
}

export const uploadTcc = multer({ storage, limits: limites, fileFilter: filtrar }).fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'capa', maxCount: 1 }
]);
