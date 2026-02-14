export interface Alimento {
  id: string
  nome: string
  categoria: 'grao' | 'carne' | 'acompanhamento' | 'verdura' | 'tempero' | 'fruta' | 'outro'
  quantidadePorPessoa: number
  unidade: 'kg' | 'g' | 'unidade' | 'litro' | 'ml'
  proporcional: boolean
}

export interface IngredienteReceita {
  alimentoId: string
  quantidadePorPessoa: number
  alimento?: Alimento
}

export interface Receita {
  id: string
  nome: string
  categoria: 'principal' | 'acompanhamento' | 'salada' | 'sobremesa'
  ingredientes: IngredienteReceita[]
  rendimento: number
}

export interface ItemCardapio {
  receitaId: string
  quantidadePessoas: number
  receita?: Receita
}

export interface DiaCardapio {
  data: string
  numeroPessoas: number
  itens: ItemCardapio[]
}

export interface Empresa {
  id: string
  nome: string
  dias: DiaCardapio[]
}

export interface Usuario {
  username: string
  password: string
}