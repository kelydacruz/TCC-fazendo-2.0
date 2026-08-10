import test from 'node:test';
import assert from 'node:assert/strict';
import { lista, regexSegura, podeModerar, ehDono } from '../utils/texto.js';

test('lista normaliza campos separados por vírgula',()=>assert.deepEqual(lista(' IoT, Web, , MongoDB '),['IoT','Web','MongoDB']));
test('regexSegura neutraliza caracteres especiais',()=>assert.equal(regexSegura('TCC (2026)?'),'TCC \\(2026\\)\\?'));
test('permissões distinguem moderadores e proprietários',()=>{assert.equal(podeModerar({perfil:'professor'}),true);assert.equal(podeModerar({perfil:'aluno'}),false);assert.equal(ehDono('123',{id:'123'}),true);});
