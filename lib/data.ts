import { Alimento, Empresa, Usuario } from './types'

export const usuarioAdmin: Usuario = {
  username: 'admin',
  password: 'admin'
}

// Dados iniciais fictícios
export const alimentosIniciais: Alimento[] = [
  // Grãos (base)
  { id: '1', nome: 'Arroz', categoria: 'grao', quantidadePorPessoa: 0.08, unidade: 'kg', proporcional: true },
  { id: '2', nome: 'Feijão', categoria: 'grao', quantidadePorPessoa: 0.04, unidade: 'kg', proporcional: true },
  { id: '3', nome: 'Macarrão', categoria: 'grao', quantidadePorPessoa: 0.06, unidade: 'kg', proporcional: true },
  { id: '4', nome: 'Mandioca', categoria: 'acompanhamento', quantidadePorPessoa: 0.05, unidade: 'kg', proporcional: true },
  
  // Carnes
  { id: '5', nome: 'Carne Moída', categoria: 'carne', quantidadePorPessoa: 0.12, unidade: 'kg', proporcional: true },
  { id: '6', nome: 'Filé de Frango', categoria: 'carne', quantidadePorPessoa: 0.15, unidade: 'kg', proporcional: true },
  { id: '7', nome: 'Costela', categoria: 'carne', quantidadePorPessoa: 0.20, unidade: 'kg', proporcional: true },
  { id: '8', nome: 'Porco no Tacho', categoria: 'carne', quantidadePorPessoa: 0.18, unidade: 'kg', proporcional: true },
  
  // Verduras/Saladas
  { id: '9', nome: 'Salada Crua', categoria: 'verdura', quantidadePorPessoa: 0.03, unidade: 'kg', proporcional: true },
  { id: '10', nome: 'Salada Cozida', categoria: 'verdura', quantidadePorPessoa: 0.04, unidade: 'kg', proporcional: true },
  { id: '11', nome: 'Batata', categoria: 'acompanhamento', quantidadePorPessoa: 0.05, unidade: 'kg', proporcional: true },
  
  // Frutas
  { id: '12', nome: 'Maçã', categoria: 'fruta', quantidadePorPessoa: 1, unidade: 'unidade', proporcional: true },
  { id: '13', nome: 'Laranja', categoria: 'fruta', quantidadePorPessoa: 1, unidade: 'unidade', proporcional: true },
  
  // Temperos (proporcionais aos grãos)
  { id: '14', nome: 'Sal', categoria: 'tempero', quantidadePorPessoa: 0.005, unidade: 'kg', proporcional: true, alimentoBaseId: '1', fatorProporcao: 0.05 },
  { id: '15', nome: 'Alho', categoria: 'tempero', quantidadePorPessoa: 0.002, unidade: 'kg', proporcional: true, alimentoBaseId: '1', fatorProporcao: 0.02 },
  { id: '16', nome: 'Cebola', categoria: 'tempero', quantidadePorPessoa: 0.003, unidade: 'kg', proporcional: true, alimentoBaseId: '1', fatorProporcao: 0.03 },
  { id: '17', nome: 'Óleo', categoria: 'tempero', quantidadePorPessoa: 0.01, unidade: 'litro', proporcional: true, alimentoBaseId: '1', fatorProporcao: 0.10 },
  
  // Molhos
  { id: '18', nome: 'Molho de Tomate', categoria: 'outro', quantidadePorPessoa: 0.05, unidade: 'kg', proporcional: true },
  { id: '19', nome: 'Doce', categoria: 'outro', quantidadePorPessoa: 0.03, unidade: 'kg', proporcional: true },
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
