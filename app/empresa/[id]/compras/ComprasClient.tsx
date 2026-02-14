'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocalStorage } from '@/lib/hooks/useStorage'
import { Empresa, Alimento, Receita } from '@/lib/types'
import { empresasIniciais, alimentosIniciais, receitasIniciais } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Download, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ComprasClient({ empresaId }: { empresaId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [empresas] = useLocalStorage<Empresa[]>('empresas', empresasIniciais)
  const [alimentos] = useLocalStorage<Alimento[]>('alimentos', alimentosIniciais)
  const [receitas] = useLocalStorage<Receita[]>('receitas', receitasIniciais)

  // Estado para mês/ano (permite navegação)
  const hoje = new Date()
  const [mes, setMes] = useState(() => 
    searchParams.get('mes') ? parseInt(searchParams.get('mes')!) - 1 : hoje.getMonth()
  )
  const [ano, setAno] = useState(() => 
    searchParams.get('ano') ? parseInt(searchParams.get('ano')!) : hoje.getFullYear()
  )

  useEffect(() => {
    const auth = localStorage.getItem('auth')
    if (!auth) router.push('/')
  }, [router])

  const empresa = useMemo(() => empresas.find(e => String(e.id) === empresaId), [empresas, empresaId])

  // Navegação de mês
  const mesAnterior = () => {
    if (mes === 0) {
      setMes(11)
      setAno(ano - 1)
    } else {
      setMes(mes - 1)
    }
  }

  const proximoMes = () => {
    if (mes === 11) {
      setMes(0)
      setAno(ano + 1)
    } else {
      setMes(mes + 1)
    }
  }

  const diasNoMes = useMemo(() => {
    if (!empresa) return []
    return empresa.dias.filter(d => {
      const dt = new Date(d.data)
      return dt.getMonth() === mes && dt.getFullYear() === ano
    })
  }, [empresa, mes, ano])

  // ✅ Cálculo correto: agrupa por categoria e ingrediente
  const comprasPorCategoria = useMemo(() => {
    const map: Record<string, { 
      quantidade: number
      unidade: string
      nome: string
      categoria: string
    }> = {}

    diasNoMes.forEach(dia => {
      dia.itens.forEach(item => {
        const receita = receitas.find(r => r.id === item.receitaId)
        if (!receita) return
        
        const pessoas = item.quantidadePessoas
        
        receita.ingredientes.forEach(ing => {
          // Fórmula: quantidadePorPessoa × (pessoas / rendimento)
          const qtd = ing.quantidadePorPessoa * (pessoas / receita.rendimento)
          
          const alimento = alimentos.find(a => a.id === ing.alimentoId)
          if (!alimento) return

          const chave = `${alimento.categoria}-${alimento.id}`
          
          if (!map[chave]) {
            map[chave] = {
              quantidade: 0,
              unidade: alimento.unidade,
              nome: alimento.nome,
              categoria: alimento.categoria
            }
          }
          map[chave].quantidade += qtd
        })
      })
    })

    // Converte para array e ordena
    const arr = Object.values(map)
    arr.sort((a, b) => 
      a.categoria.localeCompare(b.categoria) || 
      a.nome.localeCompare(b.nome)
    )
    
    return arr
  }, [diasNoMes, receitas, alimentos])

  // Agrupa por categoria para exibição
  const categoriasAgrupadas = useMemo(() => {
    const grupos: Record<string, typeof comprasPorCategoria> = {}
    
    comprasPorCategoria.forEach(item => {
      if (!grupos[item.categoria]) {
        grupos[item.categoria] = []
      }
      grupos[item.categoria].push(item)
    })
    
    return grupos
  }, [comprasPorCategoria])

  const formatarQuantidade = (qtd: number, unidade: string): string => {
    if (unidade === 'g' || unidade === 'ml') {
      return `${(qtd * 1000).toFixed(0)} ${unidade}`
    }
    if (qtd >= 1) {
      return `${qtd.toFixed(3)} ${unidade}`
    }
    return `${(qtd * 1000).toFixed(0)} g`
  }

  const exportarTxt = () => {
    const linhas: string[] = []
    linhas.push(`LISTA DE COMPRAS - ${empresa?.nome || 'Empresa'}`)
    linhas.push(`Mês: ${String(mes + 1).padStart(2, '0')}/${ano}`)
    linhas.push(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`)
    linhas.push('')
    linhas.push('CATEGORIA | INGREDIENTE | QUANTIDADE')
    linhas.push('----------------------------------------')

    Object.entries(categoriasAgrupadas).forEach(([categoria, itens]) => {
      linhas.push('')
      linhas.push(`[${categoria.toUpperCase()}]`)
      itens.forEach(item => {
        linhas.push(`${item.nome} | ${formatarQuantidade(item.quantidade, item.unidade)}`)
      })
    })

    const txt = linhas.join('\n')
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lista-compras-${empresa?.nome?.replace(/\s+/g, '-')}-${ano}-${String(mes + 1).padStart(2, '0')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const nomeMes = new Date(ano, mes).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push(`/empresa/${empresaId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Calendário
            </Button>
            <h1 className="text-xl font-bold">Lista de Compras</h1>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{empresa?.nome}</p>
            <p className="text-sm text-gray-500 capitalize">{nomeMes}</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seletor de Mês */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={mesAnterior}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-lg font-medium capitalize">{nomeMes}</span>
              </div>

              <Button variant="ghost" onClick={proximoMes}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-500">
              {diasNoMes.length} dias planejados • {comprasPorCategoria.length} ingredientes
            </p>
          </div>
          <Button onClick={exportarTxt} disabled={comprasPorCategoria.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar TXT
          </Button>
        </div>

        {/* Lista por Categoria */}
        {comprasPorCategoria.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Nenhum cardápio encontrado para este mês</p>
              <p className="text-sm text-gray-400 mt-2">
                Planeje os dias no calendário para gerar a lista de compras
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(categoriasAgrupadas).map(([categoria, itens]) => (
              <Card key={categoria}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg capitalize flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    {categoria === 'grao' ? 'Grãos' :
                     categoria === 'carne' ? 'Carnes' :
                     categoria === 'acompanhamento' ? 'Acompanhamentos' :
                     categoria === 'verdura' ? 'Verduras' :
                     categoria === 'tempero' ? 'Temperos' :
                     categoria === 'fruta' ? 'Frutas' : 'Outros'}
                    <span className="text-sm font-normal text-gray-500">({itens.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {itens.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-900">{item.nome}</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {formatarQuantidade(item.quantidade, item.unidade)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}