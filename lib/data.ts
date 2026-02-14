import { Alimento, Empresa, Usuario, Receita } from './types'

export const usuarioAdmin: Usuario = {
  username: 'admin',
  password: 'admin'
}

export const alimentosIniciais: Alimento[] = [
  // Grãos
  { id: '1', nome: 'Arroz', categoria: 'grao', quantidadePorPessoa: 0.08, unidade: 'kg', proporcional: true },
  { id: '2', nome: 'Feijão Carioca', categoria: 'grao', quantidadePorPessoa: 0.04, unidade: 'kg', proporcional: true },
  
  // Carnes
  { id: '5', nome: 'Carne Moída', categoria: 'carne', quantidadePorPessoa: 0.12, unidade: 'kg', proporcional: true },
  
  // Temperos (agora como alimentos normais, não mais complexos)
  { id: '14', nome: 'Sal', categoria: 'tempero', quantidadePorPessoa: 0.005, unidade: 'kg', proporcional: true },
  { id: '15', nome: 'Alho', categoria: 'tempero', quantidadePorPessoa: 0.002, unidade: 'kg', proporcional: true },
  { id: '16', nome: 'Cebola', categoria: 'tempero', quantidadePorPessoa: 0.02, unidade: 'kg', proporcional: true },
  { id: '17', nome: 'Óleo', categoria: 'tempero', quantidadePorPessoa: 0.01, unidade: 'litro', proporcional: true },
]

export const empresasIniciais: Empresa[] = [
  {
    id: '1',
    nome: 'Empresa ABC Ltda',
    dias: []
  },
  {
    id: '2',
    nome: 'Indústria XYZ',
    dias: []
  }
]

export const receitasIniciais: Receita[] = [
  {
    id: 'r1',
    nome: 'Arroz Branco',
    categoria: 'principal',
    rendimento: 10,
    ingredientes: [
      { alimentoId: '1', quantidadePorPessoa: 0.08 },      // Arroz
      { alimentoId: '17', quantidadePorPessoa: 0.01 },     // Óleo
      { alimentoId: '15', quantidadePorPessoa: 0.002 },    // Alho
      { alimentoId: '14', quantidadePorPessoa: 0.005 }     // Sal
    ]
  },
  {
    id: 'r2',
    nome: 'Feijão Carioca',
    categoria: 'acompanhamento',
    rendimento: 10,
    ingredientes: [
      { alimentoId: '2', quantidadePorPessoa: 0.04 },      // Feijão
      { alimentoId: '17', quantidadePorPessoa: 0.005 },    // Óleo
      { alimentoId: '15', quantidadePorPessoa: 0.002 }     // Alho
    ]
  },
  {
    id: 'r3',
    nome: 'Carne Moída Refogada',
    categoria: 'principal',
    rendimento: 10,
    ingredientes: [
      { alimentoId: '5', quantidadePorPessoa: 0.12 },      // Carne Moída
      { alimentoId: '16', quantidadePorPessoa: 0.02 },     // Cebola
      { alimentoId: '14', quantidadePorPessoa: 0.003 }     // Sal
    ]
  }
]