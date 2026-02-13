'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLocalStorage } from '@/lib/hooks/useStorage'
import { Empresa, Alimento, DiaCardapio, ItemCardapio, Receita } from '@/lib/types'
import { empresasIniciais, alimentosIniciais, receitasIniciais } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Trash2, Users } from 'lucide-react'
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

  // auth
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

  // ✅ Quando o storage carregar / dia mudar, sincroniza o estado
  useEffect(() => {
    if (!empresasReady || !empresa) return
    setNumeroPessoas(diaExistente?.numeroPessoas ?? 10)
    setItensSelecionados(diaExistente?.itens ?? [])
  }, [empresasReady, empresaId, empresa, dataStr, diaExistente?.numeroPessoas])

  if (!empresasReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Carregando...
      </div>
    )
  }

  if (!empresa) return <div>Empresa não encontrada</div>

  const abrirModalReceita = (r: Receita) => {
    setModalReceita(r)
    setModalPessoas(numeroPessoas)
  }

  const confirmarModal = () => {
    if (!modalReceita) return
    setItensSelecionados((prev) => {
      const exists = prev.find((p) => p.receitaId === modalReceita.id)
      if (exists) {
        return prev.map((p) => p.receitaId === modalReceita.id ? { ...p, quantidadePessoas: modalPessoas } : p)
      }
      return [...prev, { receitaId: modalReceita.id, quantidadePessoas: modalPessoas, receita: modalReceita }]
    })
    setModalReceita(null)
  }

  const removerReceitaSelecionada = (receitaId: string) => {
    setItensSelecionados((prev) => prev.filter(p => p.receitaId !== receitaId))
  }

  const calcularQuantidadeIngrediente = (ingrediente: any, pessoas: number, receita: Receita) => {
    // quantidade = ingrediente.quantidadePorPessoa * (pessoas / receita.rendimento)
    return ingrediente.quantidadePorPessoa * (pessoas / receita.rendimento)
  }

  const formatarQuantidade = (quantidade: number, unidade: string): string => {
    if (unidade === 'g' || unidade === 'ml') return `${quantidade.toFixed(0)} ${unidade}`
    if (quantidade >= 1) return `${quantidade.toFixed(2)} ${unidade}`
    return `${(quantidade * 1000).toFixed(0)} g`
  }

  const salvarCardapio = () => {
    const novosItens: ItemCardapio[] = itensSelecionados.map((it) => ({
      receitaId: it.receitaId,
      quantidadePessoas: it.quantidadePessoas,
      receita: receitas.find(r => r.id === it.receitaId)
    }))

    const novoDia: DiaCardapio = {
      data: dataStr,
      numeroPessoas,
      itens: novosItens,
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

  const categorias = [
    { id: 'grao', nome: 'Grãos' },
    { id: 'carne', nome: 'Carnes' },
    { id: 'acompanhamento', nome: 'Acompanhamentos' },
    { id: 'verdura', nome: 'Verduras/Saladas' },
    { id: 'fruta', nome: 'Frutas' },
    { id: 'tempero', nome: 'Temperos' },
    { id: 'outro', nome: 'Outros' },
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
              <span className="text-gray-500">pessoas</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {['principal','acompanhamento','salada','sobremesa'].map((cat) => {
              const receitasCat = receitas.filter((r) => r.categoria === (cat as any))
              if (receitasCat.length === 0) return null

              return (
                <Card key={cat}>
                  <CardHeader>
                    <CardTitle className="text-lg">{cat}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {receitasCat.map((receita) => {
                        const selecionado = itensSelecionados.some(i => i.receitaId === receita.id)

                        return (
                          <div
                            key={receita.id}
                            onClick={() => abrirModalReceita(receita)}
                            className={`
                              p-4 rounded-lg border-2 cursor-pointer transition-all
                              ${selecionado ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{receita.nome}</span>

                              {selecionado && (
                                <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {selecionado && (
                              <p className="text-sm text-primary-700 mt-1 font-medium">
                                {`Rende ${receita.rendimento} • ${receita.ingredientes.length} ingredientes`}
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
                  <div className="pb-4 border-b">
                    <p className="text-sm text-gray-500">Para</p>
                    <p className="text-2xl font-bold text-primary-600">{numeroPessoas} pessoas</p>
                  </div>

                  {itensSelecionados.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">Nenhuma receita selecionada</p>
                  ) : (
                    <div className="space-y-2">
                      {itensSelecionados.map((item) => {
                        const receita = receitas.find(r => r.id === item.receitaId)!

                        return (
                          <div key={item.receitaId} className="flex justify-between items-center py-2">
                            <div>
                              <span className="text-sm font-medium">{receita.nome}</span>
                              <div className="text-xs text-gray-500">{item.quantidadePessoas} pessoas</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => removerReceitaSelecionada(item.receitaId)}>
                                Remover
                              </Button>
                            </div>
                          </div>
                        )
                      })}

                    </div>
                  )}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500">{itensSelecionados.length} itens selecionados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {modalReceita && (
          <Modal onClose={() => setModalReceita(null)}>
            <div>
              <h3 className="text-lg font-semibold mb-2">{modalReceita.nome}</h3>
              <p className="text-sm text-gray-600 mb-4">Quantas pessoas?</p>
              <Input type="number" value={modalPessoas} onChange={e => setModalPessoas(parseInt(e.target.value || '0'))} />
              <div className="flex gap-2 mt-4 justify-end">
                <Button variant="ghost" onClick={() => setModalReceita(null)}>Cancelar</Button>
                <Button onClick={confirmarModal}>Confirmar</Button>
              </div>
            </div>
          </Modal>
        )}
      </main>
    </div>
  )
}
