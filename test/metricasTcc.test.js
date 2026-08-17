// Funcionalidade exclusiva do AcervoTCC: testes das visualizações de TCCs publicados.
import test from 'node:test';
import assert from 'node:assert/strict';
import { registrarVisualizacao } from '../utils/metricasTcc.js';

test('abrir um TCC publicado incrementa a visualização de forma atômica',async()=>{
  let chamada;
  const documento={id:'tcc-1',visualizacoes:8};
  const ModeloTcc={
    findOneAndUpdate(filtro,atualizacao,opcoes){
      chamada={filtro,atualizacao,opcoes};
      return {
        select(campo){chamada.select=campo;return this;},
        populate(campos){chamada.populate=campos;return Promise.resolve(documento);}
      };
    }
  };

  const resultado=await registrarVisualizacao(ModeloTcc,'tcc-1');
  assert.equal(resultado,documento);
  assert.deepEqual(chamada.filtro,{_id:'tcc-1',status:'Publicado'});
  assert.deepEqual(chamada.atualizacao,{$inc:{visualizacoes:1}});
  assert.deepEqual(chamada.opcoes,{new:true});
  assert.equal(chamada.select,'-pdf.dados');
  assert.equal(chamada.populate,'curso turma orientador');
});
