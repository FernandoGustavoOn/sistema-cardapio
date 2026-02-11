'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLocalStorage } from '@/lib/hooks/useStorage'
import { Empresa, Alimento } from '@/lib/types'
import { alimentosIniciais } from '@/lib/data'
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
  const relatorioRef = useRef<HTMLDivElement>(null)
  
  const empresa = empresas.find(e => e.id === params.empresaId)

  useEffect(() => {
    const auth = localStorage.getItem('auth')
    if (!auth) router.push('/')
  }, [router])

  if (!empresa) return <div>Empresa não encontrada</div>

  // Calcula totais
  const totais: Record<string, { nome: string; quantidade: number; unidade: string; categoria: string }> = {}

  empresa.dias.forEach(dia => {
    dia.itens.forEach(item => {
      const alimento = alimentos.find(a => a.id === item.alimentoId)
      if (alimento) {
        if (!totais[alimento.id]) {
          totais[alimento.id] = {
            nome: alimento.nome,
            quantidade: 0,
            unidade: alimento.unidade,
            categoria: alimento.categoria
          }
        }
        totais[alimento.id].quantidade += item.quantidade
      }
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
    const conteudo = `
      RELATÓRIO DE PLANEJAMENTO - ${empresa.nome.toUpperCase()}
      
      Período: ${empresa.dias.length} dias planejados
      
      RESUMO CONSOLIDADO:
      ${Object.values(totais).map(item => 
        `- ${item.nome}: ${formatarQuantidade(item.quantidade, item.unidade)}`
      ).join('\n')}
      
      DETALHAMENTO POR DIA:
      ${empresa.dias.map(dia => {
        const data = parseISO(dia.data)
        return `
${format(data, 'dd/MM/yyyy')} - ${dia.numeroPessoas} pessoas:
${dia.itens.map(i => `  • ${i.alimento?.nome}: ${formatarQuantidade(i.quantidade, i.alimento?.unidade || 'kg')}`).join('\n')}
        `
      }).join('\n')}
    `

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
                          {dia.itens.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="text-gray-600">{item.alimento?.nome}</span>
                              <span className="font-medium text-gray-900">
                                {formatarQuantidade(item.quantidade, item.alimento?.unidade || 'kg')}
                              </span>
                            </div>
                          ))}
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
