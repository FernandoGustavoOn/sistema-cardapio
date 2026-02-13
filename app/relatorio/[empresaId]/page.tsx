'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLocalStorage } from '@/lib/hooks/useStorage'
import { Empresa, Alimento, Receita } from '@/lib/types'
import { alimentosIniciais, receitasIniciais } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'


export default function RelatorioPage() {
  const router = useRouter()
  const params = useParams()
  const [empresas] = useLocalStorage<Empresa[]>('empresas', [])
  const [alimentos] = useLocalStorage<Alimento[]>('alimentos', alimentosIniciais)
  const [receitas] = useLocalStorage<Receita[]>('receitas', receitasIniciais)
  const relatorioRef = useRef<HTMLDivElement>(null)
  
  const empresa = empresas.find(e => e.id === params.empresaId)

  useEffect(() => {
    const auth = localStorage.getItem('auth')
    if (!auth) router.push('/')
  }, [router])

  if (!empresa) return <div>Empresa não encontrada</div>

  // Calcula totais a partir de receitas e ingredientes
  const totais: Record<string, { nome: string; quantidade: number; unidade: string; categoria: string }> = {}

  empresa.dias.forEach(dia => {
    dia.itens.forEach(item => {
      const receita = receitas.find(r => r.id === item.receitaId)
      if (!receita) return
      const pessoas = item.quantidadePessoas
      receita.ingredientes.forEach(ing => {
        const alimento = alimentos.find(a => a.id === ing.alimentoId)
        const unidade = alimento?.unidade || 'kg'
        const nome = alimento?.nome || ing.alimentoId
        const categoria = alimento?.categoria || 'outro'
        const qtd = ing.quantidadePorPessoa * (pessoas / receita.rendimento)

        if (!totais[ing.alimentoId]) {
          totais[ing.alimentoId] = { nome, quantidade: 0, unidade, categoria }
        }
        totais[ing.alimentoId].quantidade += qtd
      })
    })
  })

  const categoriasOrder = ['grao', 'carne', 'acompanhamento', 'verdura', 'fruta', 'tempero', 'outro']
  const categoriasNome: Record<string, string> = {
    grao: 'Grãos',
    carne: 'Carnes',
    acompanhamento: 'Acompanhamentos',
    verdura: 'Verduras/Saladas',
    fruta: 'Frutas',
    tempero: 'Temperos',
    outro: 'Outros'
  }

  const formatarQuantidade = (quantidade: number, unidade: string): string => {
    if (quantidade >= 1) {
      return `${quantidade.toFixed(2)} ${unidade}`
    } else {
      return `${(quantidade * 1000).toFixed(0)} g`
    }
  }

  const gerarPDF = () => {
    const lines: string[] = []
    lines.push(`RELATÓRIO DE PLANEJAMENTO - ${empresa.nome.toUpperCase()}`)
    lines.push('')
    lines.push(`Período: ${empresa.dias.length} dias planejados`)
    lines.push('')
    lines.push('RESUMO CONSOLIDADO:')
    Object.values(totais).forEach(item => {
      lines.push(`- ${item.nome}: ${formatarQuantidade(item.quantidade, item.unidade)}`)
    })
    lines.push('')
    lines.push('DETALHAMENTO POR DIA:')
    empresa.dias.forEach(dia => {
      const data = parseISO(dia.data)
      lines.push('')
      lines.push(`${format(data, 'dd/MM/yyyy')} - ${dia.numeroPessoas} pessoas:`)
      dia.itens.forEach(i => {
        const receita = receitas.find(r => r.id === i.receitaId)
        lines.push(`  ${receita?.nome || i.receitaId} • ${i.quantidadePessoas} pessoas`)
        receita?.ingredientes.forEach(ing => {
          const alimento = alimentos.find(a => a.id === ing.alimentoId)
          const qtd = ing.quantidadePorPessoa * (i.quantidadePessoas / (receita?.rendimento || 1))
          lines.push(`    • ${alimento?.nome || ing.alimentoId}: ${formatarQuantidade(qtd, alimento?.unidade || 'kg')}`)
        })
      })
    })

    const conteudo = lines.join('\n')

    const blob = new Blob([conteudo], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${empresa.nome.replace(/\s+/g, '-').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const imprimir = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push(`/empresa/${params.empresaId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Relatório Mensal</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={gerarPDF}>
              <Download className="w-4 h-4 mr-2" />
              Baixar TXT
            </Button>
            <Button onClick={imprimir}>
              <FileText className="w-4 h-4 mr-2" />
              Imprimir / PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div ref={relatorioRef} className="bg-white p-8 rounded-xl shadow-lg print:shadow-none">
          <div className="text-center mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{empresa.nome}</h1>
            <p className="text-gray-500">Relatório de Planejamento de Refeições</p>
            <p className="text-sm text-gray-400 mt-1">
              Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resumo Consolidado do Mês</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-sm text-gray-500 mb-4">
                Total de dias planejados: <span className="font-bold text-gray-900">{empresa.dias.length}</span>
              </p>
              
              {categoriasOrder.map(cat => {
                const itensCat = Object.values(totais).filter(t => t.categoria === cat)
                if (itensCat.length === 0) return null

                return (
                  <div key={cat} className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">{categoriasNome[cat]}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {itensCat.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 px-3 bg-white rounded border">
                          <span className="text-gray-700">{item.nome}</span>
                          <span className="font-mono font-medium text-primary-600">
                            {formatarQuantidade(item.quantidade, item.unidade)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Detalhamento por Dia</h2>
            <div className="space-y-4">
              {empresa.dias.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum dia planejado</p>
              ) : (
                empresa.dias
                  .sort((a, b) => a.data.localeCompare(b.data))
                  .map(dia => {
                    const data = parseISO(dia.data)
                    return (
                      <div key={dia.data} className="border rounded-lg p-4 break-inside-avoid">
                        <div className="flex justify-between items-center mb-3 border-b pb-2">
                          <h3 className="font-semibold text-gray-900">
                            {format(data, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {dia.numeroPessoas} pessoas
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                          {dia.itens.map((item, idx) => {
                            const receita = receitas.find(r => r.id === item.receitaId)
                            return (
                              <div key={idx} className="flex flex-col w-full mb-2">
                                <div className="font-medium">{receita?.nome} • {item.quantidadePessoas} pessoas</div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {receita?.ingredientes.map((ing, i) => {
                                    const alimento = alimentos.find(a => a.id === ing.alimentoId)
                                    const qtd = ing.quantidadePorPessoa * (item.quantidadePessoas / (receita?.rendimento || 1))
                                    return (
                                      <div key={i} className="flex justify-between">
                                        <span className="text-gray-600">{alimento?.nome || ing.alimentoId}</span>
                                        <span className="font-medium text-gray-900">{formatarQuantidade(qtd, alimento?.unidade || 'kg')}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
