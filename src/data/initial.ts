import { GR, MT, RC } from '../types'

export const GRS_INICIAL: GR[] = [
  { codigo: 'GR6', nome: 'Região 6' },
  { codigo: 'GR7', nome: 'Região 7' },
]

export const MTS_INICIAL: MT[] = [
  { gr: 'GR6', codigo: 'MT1', nome: '' },
  { gr: 'GR6', codigo: 'MT4', nome: '' },
  { gr: 'GR6', codigo: 'MT5', nome: '' },
  { gr: 'GR7', codigo: 'MT2', nome: '' },
  { gr: 'GR7', codigo: 'MT3', nome: '' },
  { gr: 'GR7', codigo: 'MT6', nome: '' },
]

export const RCS_INICIAL: RC[] = [
  // GR6 — MT1
  { gr:'GR6', mt:'MT1', rc:'Pedro', razao:'VIP COMERCIO DE RAÇÔES LTDA ME', notaRC:2.56, notaRegiao:4.2, notaLog:2, vol:4, cidade:'', foco:false },
  { gr:'GR6', mt:'MT1', rc:'Berrante', razao:'R.L.C - COMERCIO DE PRODUTOS AGROPECUÁRIOS LTDA', notaRC:2.44, notaRegiao:4.0, notaLog:2, vol:4, cidade:'', foco:false },
  { gr:'GR6', mt:'MT1', rc:'Alisson', razao:'LLAGRO AGROPECUÁRIA LTDA', notaRC:3.22, notaRegiao:4.4, notaLog:3, vol:3, cidade:'', foco:false },
  { gr:'GR6', mt:'MT1', rc:'Júnior', razao:'MANEJO COMERCIO E REPRESENTAÇOES LTDA', notaRC:2.56, notaRegiao:4.2, notaLog:2, vol:3, cidade:'', foco:false },
  { gr:'GR6', mt:'MT1', rc:'Rafael', razao:'RA REPRESENTAÇÃO COMERCIAL', notaRC:1.78, notaRegiao:3.6, notaLog:3, vol:1, cidade:'', foco:false },
  { gr:'GR6', mt:'MT1', rc:'Israel', razao:'K S B SEHN', notaRC:1.22, notaRegiao:4.4, notaLog:3, vol:1, cidade:'', foco:false },
  { gr:'GR6', mt:'MT1', rc:'Alcides', razao:'AGROCANARANA COMERCIO E REPRESENTAÇÕES COMERCIAIS', notaRC:1.22, notaRegiao:3.6, notaLog:1, vol:1, cidade:'', foco:false },
  // GR7 — MT2
  { gr:'GR7', mt:'MT2', rc:'Simão', razao:'SS REPRESENTACOES COMERCIAIS LTDA', notaRC:1.8, notaRegiao:4.0, notaLog:4.5, vol:3, cidade:'Sinop', foco:false },
  { gr:'GR7', mt:'MT2', rc:'Diego', razao:'ASP VILELA SERVICOS LTDA', notaRC:0.7, notaRegiao:3.2, notaLog:0.5, vol:1, cidade:'Novo Progresso', foco:false },
  { gr:'GR7', mt:'MT2', rc:'Marlon', razao:'MARLON WILIAM BERTOLINI', notaRC:1.1, notaRegiao:4.0, notaLog:4.5, vol:1, cidade:'Sorriso', foco:false },
  { gr:'GR7', mt:'MT2', rc:'Mateus e Otomar', razao:'MARTIAGRO REPRESENTACOES LTDA', notaRC:4.4, notaRegiao:4.2, notaLog:5, vol:5, cidade:'Lucas do Rio Verde', foco:false },
  { gr:'GR7', mt:'MT2', rc:'Paulinho', razao:'S LAZZERIS CARVALHO LTDA', notaRC:1.0, notaRegiao:3.2, notaLog:0.5, vol:1, cidade:'Castelo dos Sonhos', foco:false },
  { gr:'GR7', mt:'MT2', rc:'Léo', razao:'LEONARDO RAFAEL MEYER NUNES', notaRC:1.6, notaRegiao:3.4, notaLog:1.5, vol:1, cidade:'Nova União do Sul', foco:false },
  { gr:'GR7', mt:'MT2', rc:'Prudentina', razao:'AGRO PECUARIA PRUDENTINA LTDA', notaRC:1.7, notaRegiao:4.4, notaLog:1.5, vol:2, cidade:'Nova Canaã', foco:false },
  { gr:'GR7', mt:'MT2', rc:'Agrolider', razao:'CARVALHO COMERCIO DE PRODUTOS AGROPECUARIOS LTDA', notaRC:0.6, notaRegiao:3.6, notaLog:2.5, vol:1, cidade:'Colider', foco:false },
  { gr:'GR7', mt:'MT2', rc:'Garimpão', razao:'GARIMPAO AGROPECUARIA LTDA', notaRC:1.7, notaRegiao:3.4, notaLog:1.5, vol:2, cidade:'Guarantã do Norte', foco:false },
  // GR7 — MT3
  { gr:'GR7', mt:'MT3', rc:'Rato', razao:'MACIEL E COSTA LTDA', notaRC:4.2, notaRegiao:4.6, notaLog:4, vol:5, cidade:'Juara', foco:false },
  { gr:'GR7', mt:'MT3', rc:'Erineu', razao:'E SCHROCK', notaRC:2.6, notaRegiao:3.2, notaLog:0.5, vol:3, cidade:'Colniza', foco:false },
  { gr:'GR7', mt:'MT3', rc:'Alex e Carlos', razao:'BRASVET AGROPECUARIA LTDA', notaRC:2.0, notaRegiao:4.2, notaLog:4, vol:2, cidade:'Brasnorte', foco:false },
  { gr:'GR7', mt:'MT3', rc:'Jeferson e Bruno', razao:'J. A. SANTOS AGROPECUARIA LTDA', notaRC:2.3, notaRegiao:3.0, notaLog:1, vol:2, cidade:'Conselvan', foco:false },
  { gr:'GR7', mt:'MT3', rc:'Luciano', razao:'LUCIANO ZANONI EPP', notaRC:1.3, notaRegiao:4.0, notaLog:1, vol:1, cidade:'Aripuanã', foco:false },
  { gr:'GR7', mt:'MT3', rc:'Allan', razao:'ALLAN VINICIUS DUARTE SCARIOT', notaRC:0.2, notaRegiao:4.6, notaLog:4, vol:1, cidade:'Porto dos Gaúchos', foco:false },
  { gr:'GR7', mt:'MT3', rc:'Clemildo', razao:'CLEMILDO DOS SANTOS DA SILVA', notaRC:0.2, notaRegiao:3.2, notaLog:1, vol:1, cidade:'Castanheira', foco:false },
  // GR6 — MT4
  { gr:'GR6', mt:'MT4', rc:'José Eduardo', razao:'JRB REPRESENTACOES LTDA', notaRC:3.0, notaRegiao:4.2, notaLog:4.5, vol:3, cidade:'', foco:false },
  { gr:'GR6', mt:'MT4', rc:'Beto', razao:'ROBERTO MOREIRA FERREIRA', notaRC:2.44, notaRegiao:3.6, notaLog:4, vol:3, cidade:'', foco:false },
  { gr:'GR6', mt:'MT4', rc:'Sérgio (Gerente)', razao:'57.007.359 PAULO SERGIO DE SOUZA', notaRC:1.0, notaRegiao:1.0, notaLog:1, vol:1, cidade:'', foco:false },
  { gr:'GR6', mt:'MT4', rc:'Haroldo', razao:'HAROLDO J DUTRA MIRANDA COMERCIO E REPRESENTACOES LTDA', notaRC:1.0, notaRegiao:null, notaLog:null, vol:1, cidade:'', foco:false },
  { gr:'GR6', mt:'MT4', rc:'Marcus', razao:'RURAL FORCE AGROPEC LTDA', notaRC:1.33, notaRegiao:4.0, notaLog:4.5, vol:1, cidade:'', foco:false },
  // GR6 — MT5
  { gr:'GR6', mt:'MT5', rc:'Gean e Jefter', razao:'BITENCOURT COMERCIO E REPRESENTACAO DE PRODUTOS AGROPECUARIOS LTDA', notaRC:2.44, notaRegiao:4.4, notaLog:4.5, vol:2, cidade:'', foco:false },
  { gr:'GR6', mt:'MT5', rc:'Tiago Onça', razao:'ONCA REPRESENTANTES COMERCIAIS LTDA', notaRC:3.0, notaRegiao:4.2, notaLog:4, vol:3, cidade:'', foco:false },
  { gr:'GR6', mt:'MT5', rc:'Odilon', razao:'POLARIZE AGRO REPRESENTACOES E TRANSPORTES LTDA', notaRC:3.11, notaRegiao:4.0, notaLog:3.5, vol:3, cidade:'', foco:false },
  { gr:'GR6', mt:'MT5', rc:'Tiago Jauru', razao:'MARCELA CRISTINA RODRIGUES LOPES LTDA', notaRC:2.44, notaRegiao:3.6, notaLog:3, vol:1, cidade:'', foco:false },
  { gr:'GR6', mt:'MT5', rc:'César - Comodoro', razao:'LAF REPRESENTACAO LTDA', notaRC:1.78, notaRegiao:3.8, notaLog:3.5, vol:1, cidade:'Comodoro', foco:false },
  { gr:'GR6', mt:'MT5', rc:'Péricles', razao:'CAPRONI E ROCHA EMPREENDIMENTOS LTDA', notaRC:1.67, notaRegiao:3.6, notaLog:3.5, vol:1, cidade:'', foco:false },
  { gr:'GR6', mt:'MT5', rc:'Estevan - Sementes', razao:'VIEIRA JUNIOR E VIEIRA LTDA', notaRC:1.0, notaRegiao:4.2, notaLog:4, vol:1, cidade:'', foco:false },
  { gr:'GR6', mt:'MT5', rc:'Fernando TecnoCampo', razao:'J P. BARCELLOS LTDA', notaRC:2.67, notaRegiao:4.2, notaLog:3.5, vol:1, cidade:'', foco:false },
  { gr:'GR6', mt:'MT5', rc:'Félix', razao:'VILAS NOVAS GRESELLE E CIA. LTDA. EPP', notaRC:2.44, notaRegiao:4.0, notaLog:3.5, vol:3, cidade:'', foco:false },
]
