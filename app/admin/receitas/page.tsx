'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocalStorage } from '@/lib/hooks/useStorage'
import { Alimento, Receita, IngredienteReceita } from '@/lib/types'
import { alimentosIniciais, receitasIniciais } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

export default function AdminReceitasPage() {
  const router = useRouter()
  const [alimentos] = useLocalStorage<Alimento[]>('alimentos', alimentosIniciais)
  const [receitas, setReceitas] = useLocalStorage<Receita[]>('receitas', receitasIniciais)

  const [novaReceita, setNovaReceita] = useState<Partial<Receita>>({
    nome: '',
    categoria: 'principal',
    rendimento: 10,
    ingredientes: []
  })

  const [ingSelection, setIngSelection] = useState<{alimentoId: string, quantidadePorPessoa: number}>({alimentoId: alimentos[0]?.id || '', quantidadePorPessoa: 0})

  useEffect(() => {
    const auth = localStorage.getItem('auth')
    if (!auth) router.push('/')
  }, [router])

  const adicionarIngredienteTemp = () => {
    if (!ingSelection.alimentoId || !ingSelection.quantidadePorPessoa) return
    const ing: IngredienteReceita = { alimentoId: ingSelection.alimentoId, quantidadePorPessoa: ingSelection.quantidadePorPessoa }
    setNovaReceita({ ...novaReceita, ingredientes: [...(novaReceita.ingredientes || []), ing] })
    setIngSelection({ alimentoId: alimentos[0]?.id || '', quantidadePorPessoa: 0 })
  }

  const removerIngredienteTemp = (index: number) => {
    const arr = (novaReceita.ingredientes || []).slice()
    arr.splice(index, 1)
    setNovaReceita({ ...novaReceita, ingredientes: arr })
  }

  const salvarReceita = () => {
    if (!novaReceita.nome || !novaReceita.rendimento || !novaReceita.ingredientes || novaReceita.ingredientes.length === 0) return
    const r: Receita = {
      id: Date.now().toString(),
      nome: novaReceita.nome!,
      categoria: novaReceita.categoria as any,
      rendimento: novaReceita.rendimento!,
      ingredientes: novaReceita.ingredientes as IngredienteReceita[]
    }
    setReceitas([...receitas, r])
    setNovaReceita({ nome: '', categoria: 'principal', rendimento: 10, ingredientes: [] })
  }

  const removerReceita = (id: string) => {
    setReceitas(receitas.filter(r => r.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Gerenciar Receitas</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nova Receita
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <Input
                  value={novaReceita.nome || ''}
                  onChange={e => setNovaReceita({...novaReceita, nome: e.target.value})}
                  placeholder="Ex: Arroz Branco"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select
                  className="w-full h-10 rounded-lg border border-gray-300 px-3"
                  value={novaReceita.categoria}
                  onChange={e => setNovaReceita({...novaReceita, categoria: e.target.value as any})}
                >
                  <option value="principal">Principal</option>
                  <option value="acompanhamento">Acompanhamento</option>
                  <option value="salada">Salada</option>
                  <option value="sobremesa">Sobremesa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rendimento (pessoas)</label>
                <Input
                  type="number"
                  value={novaReceita.rendimento || 10}
                  onChange={e => setNovaReceita({...novaReceita, rendimento: parseInt(e.target.value || '10')})}
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Ingredientes</h4>
                <div className="flex gap-2 items-center">
                  <select className="flex-1 h-10 rounded-lg border border-gray-300 px-3" value={ingSelection.alimentoId} onChange={e => setIngSelection({...ingSelection, alimentoId: e.target.value})}>
                    {alimentos.map(a => (
                      <option key={a.id} value={a.id}>{a.nome}</option>
                    ))}
                  </select>
                  <Input type="number" step="0.001" className="w-32" value={ingSelection.quantidadePorPessoa || ''} onChange={e => setIngSelection({...ingSelection, quantidadePorPessoa: parseFloat(e.target.value)})} placeholder="Qtd/pessoa" />
                  <Button onClick={adicionarIngredienteTemp}>Adicionar</Button>
                </div>

                <div className="mt-3 space-y-2">
                  {(novaReceita.ingredientes || []).map((ing, idx) => {
                    const a = alimentos.find(x => x.id === ing.alimentoId)
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{a?.nome || ing.alimentoId}</p>
                          <p className="text-sm text-gray-500">{ing.quantidadePorPessoa} por pessoa</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removerIngredienteTemp(idx)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Button onClick={salvarReceita} className="w-full">Salvar Receita</Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Receitas Cadastradas ({receitas.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {receitas.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{r.nome}</p>
                      <p className="text-sm text-gray-500">{r.categoria} • {r.ingredientes.length} ingredientes • rende {r.rendimento} pessoas</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => removerReceita(r.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
