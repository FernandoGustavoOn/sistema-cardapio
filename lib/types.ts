export interface Alimento {
  id: string
  nome: string
  categoria: 'grao' | 'carne' | 'acompanhamento' | 'verdura' | 'tempero' | 'fruta' | 'outro'
  quantidadePorPessoa: number // em kg ou unidade
  unidade: 'kg' | 'g' | 'unidade' | 'litro' | 'ml'
  proporcional: boolean // true = escala com pessoas, false = fixo (mas tempero vai ser proporcional ao principal)
  alimentoBaseId?: string // se for tempero, qual alimento ele segue (ex: tempero do arroz)
  fatorProporcao?: number // ex: 0.1 = 10% da quantidade do alimento base
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
  data: string // YYYY-MM-DD
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
