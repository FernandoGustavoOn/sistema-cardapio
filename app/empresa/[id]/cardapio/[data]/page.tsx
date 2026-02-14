'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLocalStorage } from '@/lib/hooks/useStorage'
import { Empresa, Alimento, DiaCardapio, ItemCardapio, Receita } from '@/lib/types'
import { empresasIniciais, alimentosIniciais, receitasIniciais } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Trash2, Users, ChefHat } from 'lucide-react'
import Modal from '@/components/ui/modal'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function CardapioDiaPage() {
  const router = useRouter()
  const params = useParams()

  const empresaId = String(params.id)
  const dataStr = String(params.data)
  const dataDate = parseISO(dataStr)

  const [empresas, setEmpresas, empresasReady] = useLocalStorage<Empresa[]>(
    'empresas',
    empresasIniciais
  )
  const [alimentos] = useLocalStorage<Alimento[]>('alimentos', alimentosIniciais)
  const [receitas] = useLocalStorage<Receita[]>('receitas', receitasIniciais)

  useEffect(() => {
    const auth = localStorage.getItem('auth')
    if (!auth) router.push('/')
  }, [router])

  const empresa = useMemo(
    () => empresas.find((e) => String(e.id) === empresaId),
    [empresas, empresaId]
  )

  const diaExistente = useMemo(
    () => empresa?.dias.find((d) => d.data === dataStr),
    [empresa, dataStr]
  )

  const [numeroPessoas, setNumeroPessoas] = useState(10)
  const [itensSelecionados, setItensSelecionados] = useState<ItemCardapio[]>([])
  const [modalReceita, setModalReceita] = useState<Receita | null>(null)
  const [modalPessoas, setModalPessoas] = useState<number>(10)

  useEffect(() => {
    if (!empresasReady || !empresa) return
    setNumeroPessoas(diaExistente?.numeroPessoas ?? 10)
    setItensSelecionados(diaExistente?.itens ?? [])
  }, [empresasReady, empresaId, empresa, dataStr, diaExistente])

  if (!empresasReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Carregando...
      </div>
    )
  }

  if (!empresa) return <div>Empresa não encontrada</div>

  const abrirModalReceita = (r: Receita) => {
    const existente = itensSelecionados.find(i => i.receitaId === r.id)
    setModalReceita(r)
    setModalPessoas(existente?.quantidadePessoas ?? numeroPessoas)
  }

  const confirmarModal = () => {
    if (!modalReceita) return
    setItensSelecionados((prev) => {
      const exists = prev.find((p) => p.receitaId === modalReceita.id)
      if (exists) {
        return prev.map((p) => p.receitaId === modalReceita.id 
          ? { ...p, quantidadePessoas: modalPessoas } 
          : p
        )
      }
      return [...prev, { 
        receitaId: modalReceita.id, 
        quantidadePessoas: modalPessoas 
      }]
    })
    setModalReceita(null)
  }

  const removerReceitaSelecionada = (receitaId: string) => {
    setItensSelecionados((prev) => prev.filter(p => p.receitaId !== receitaId))
  }

  // ✅ Cálculo correto: quantidade = qtdPorPessoa × (pessoas / rendimento)
  const calcularIngrediente = (ing: any, pessoas: number, rendimento: number) => {
    return ing.quantidadePorPessoa * (pessoas / rendimento)
  }

  const formatarQuantidade = (qtd: number, unidade: string): string => {
    if (qtd >= 1) return `${qtd.toFixed(3)} ${unidade}`
    return `${(qtd * 1000).toFixed(0)} g`
  }

  // ✅ Agrupa ingredientes de todas as receitas selecionadas
  const ingredientesTotais = useMemo(() => {
    const map: Record<string, { 
      alimento: any, 
      quantidadeTotal: number 
    }> = {}

    itensSelecionados.forEach(item => {
      const receita = receitas.find(r => r.id === item.receitaId)
      if (!receita) return

      receita.ingredientes.forEach(ing => {
        const alimento = alimentos.find(a => a.id === ing.alimentoId)
        if (!alimento) return

        const qtd = calcularIngrediente(ing, item.quantidadePessoas, receita.rendimento)

        if (!map[alimento.id]) {
          map[alimento.id] = { alimento, quantidadeTotal: 0 }
        }
        map[alimento.id].quantidadeTotal += qtd
      })
    })

    return Object.values(map).sort((a, b) => 
      a.alimento.categoria.localeCompare(b.alimento.categoria) ||
      a.alimento.nome.localeCompare(b.alimento.nome)
    )
  }, [itensSelecionados, receitas, alimentos])

  const salvarCardapio = () => {
    const novoDia: DiaCardapio = {
      data: dataStr,
      numeroPessoas,
      itens: itensSelecionados.map(it => ({
        receitaId: it.receitaId,
        quantidadePessoas: it.quantidadePessoas
      })),
    }

    const novasEmpresas = empresas.map((e) => {
      if (String(e.id) === empresaId) {
        const diasFiltrados = e.dias.filter((d) => d.data !== dataStr)
        return { ...e, dias: [...diasFiltrados, novoDia] }
      }
      return e
    })

    setEmpresas(novasEmpresas)
    router.push(`/empresa/${empresaId}`)
  }

  const excluirCardapio = () => {
    const novasEmpresas = empresas.map((e) => {
      if (String(e.id) === empresaId) {
        return { ...e, dias: e.dias.filter((d) => d.data !== dataStr) }
      }
      return e
    })

    setEmpresas(novasEmpresas)
    router.push(`/empresa/${empresaId}`)
  }

  const categoriasReceita = [
    { id: 'principal', nome: 'Principais' },
    { id: 'acompanhamento', nome: 'Acompanhamentos' },
    { id: 'salada', nome: 'Saladas' },
    { id: 'sobremesa', nome: 'Sobremesas' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push(`/empresa/${empresaId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Calendário
            </Button>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {format(dataDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </h1>
              <p className="text-sm text-gray-500">{empresa.nome}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {diaExistente && (
              <Button variant="danger" onClick={excluirCardapio}>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            )}

            <Button onClick={salvarCardapio}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Cardápio
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Número de Pessoas
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="1"
                value={numeroPessoas}
                onChange={(e) => setNumeroPessoas(parseInt(e.target.value) || 0)}
                className="w-32 text-lg"
              />
              <span className="text-gray-500">pessoas (padrão para novas receitas)</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {categoriasReceita.map((cat) => {
              const receitasCat = receitas.filter((r) => r.categoria === cat.id)
              if (receitasCat.length === 0) return null

              return (
                <Card key={cat.id}>
                  <CardHeader>
                    <CardTitle className="text-lg capitalize">{cat.nome}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {receitasCat.map((receita) => {
                        const selecionado = itensSelecionados.find(i => i.receitaId === receita.id)

                        return (
                          <div
                            key={receita.id}
                            onClick={() => abrirModalReceita(receita)}
                            className={`
                              p-4 rounded-lg border-2 cursor-pointer transition-all
                              ${selecionado 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                              }
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium flex items-center gap-2">
                                <ChefHat className="w-4 h-4" />
                                {receita.nome}
                              </span>

                              {selecionado && (
                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            <p className="text-sm text-gray-500 mt-1">
                              {receita.ingredientes.length} ingredientes • Rende {receita.rendimento} pessoas
                            </p>

                            {selecionado && (
                              <p className="text-sm text-blue-700 mt-2 font-medium">
                                Para {selecionado.quantidadePessoas} pessoas
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Resumo do Dia</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Receitas Selecionadas */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Receitas ({itensSelecionados.length})</p>
                    {itensSelecionados.length === 0 ? (
                      <p className="text-gray-400 text-sm">Nenhuma receita selecionada</p>
                    ) : (
                      <div className="space-y-2">
                        {itensSelecionados.map((item) => {
                          const receita = receitas.find(r => r.id === item.receitaId)
                          if (!receita) return null

                          return (
                            <div key={item.receitaId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div>
                                <span className="text-sm font-medium">{receita.nome}</span>
                                <div className="text-xs text-gray-500">
                                  {item.quantidadePessoas} pessoas
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removerReceitaSelecionada(item.receitaId)}
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Ingredientes Totais */}
                  {ingredientesTotais.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-2">Ingredientes Totais</p>
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {ingredientesTotais.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.alimento.nome}</span>
                            <span className="font-medium">
                              {formatarQuantidade(item.quantidadeTotal, item.alimento.unidade)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {modalReceita && (
          <Modal onClose={() => setModalReceita(null)}>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{modalReceita.nome}</h3>
              <p className="text-sm text-gray-600 mb-4">
                Quantas pessoas vão comer esta receita?
              </p>
              <Input 
                type="number" 
                min="1"
                value={modalPessoas} 
                onChange={e => setModalPessoas(parseInt(e.target.value) || 0)} 
                className="mb-4"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setModalReceita(null)}>
                  Cancelar
                </Button>
                <Button onClick={confirmarModal}>Confirmar</Button>
              </div>
            </div>
          </Modal>
        )}
      </main>
    </div>
  )
}