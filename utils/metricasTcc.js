// Funcionalidade exclusiva do AcervoTCC: contabiliza visualizações apenas em trabalhos publicados.
export async function registrarVisualizacao(ModeloTcc, id) {
    return ModeloTcc.findOneAndUpdate(
        { _id: id, status: 'Publicado' },
        { $inc: { visualizacoes: 1 } },
        { new: true }
    ).select('-pdf.dados').populate('curso turma orientador');
}
