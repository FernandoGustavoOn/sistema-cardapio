'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useLocalStorage } from '@/lib/hooks/useStorage'
import { Empresa, Alimento, Receita } from '@/lib/types'
import { empresasIniciais, alimentosIniciais, receitasIniciais } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function ComprasClient({ empresaId, mes, ano }: { empresaId: string; mes: number; ano: number }) {
  const router = useRouter()

  const [empresas] = useLocalStorage<Empresa[]>('empresas', empresasIniciais)
  const [alimentos] = useLocalStorage<Alimento[]>('alimentos', alimentosIniciais)
  const [receitas] = useLocalStorage<Receita[]>('receitas', receitasIniciais)

  useEffect(() => {
    const auth = localStorage.getItem('auth')
    if (!auth) router.push('/')
  }, [router])

  const empresa = useMemo(() => empresas.find(e => String(e.id) === empresaId), [empresas, empresaId])

  const diasNoMes = useMemo(() => {
    if (!empresa) return []
    return empresa.dias.filter(d => {
      const dt = new Date(d.data)
      return dt.getMonth() === mes && dt.getFullYear() === ano
    })
  }, [empresa, mes, ano])

  const agrupado = useMemo(() => {
    const map: Record<string, { quantidade: number; unidade: string; nome: string; categoria: string }> = {}

    diasNoMes.forEach(dia => {
      dia.itens.forEach(item => {
        const receita = receitas.find(r => r.id === item.receitaId)
        if (!receita) return
        const pessoas = item.quantidadePessoas
        receita.ingredientes.forEach(ing => {
          const qtd = ing.quantidadePorPessoa * (pessoas / receita.rendimento)
          const alimento = alimentos.find(a => a.id === ing.alimentoId)
          const unidade = alimento?.unidade || 'kg'
          const nome = alimento?.nome || ing.alimentoId
          const categoria = alimento?.categoria || 'outro'

          if (!map[ing.alimentoId]) {
            map[ing.alimentoId] = { quantidade: 0, unidade, nome, categoria }
          }
          map[ing.alimentoId].quantidade += qtd
        })
      })
    })

    const arr = Object.keys(map).map(id => ({ id, ...map[id] }))
    arr.sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nome.localeCompare(b.nome))
    return arr
  }, [diasNoMes, receitas, alimentos])

  const exportarTxt = () => {
    const lines = agrupado.map(i => `${i.categoria} | ${i.nome} | ${i.quantidade.toFixed(3)} ${i.unidade}`)
    const txt = lines.join('\n')
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lista-compras-${ano}-${mes+1}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push(`/empresa/${empresaId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-bold">Lista de Compras</h1>
          </div>

          <div>
            <p className="text-sm text-gray-500">{empresa?.nome}</p>
            <p className="text-sm text-gray-500">Mês: {mes+1}/{ano}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-6">
          <Button onClick={exportarTxt}>Exportar TXT</Button>
          <Button variant="ghost" onClick={() => router.push(`/empresa/${empresaId}`)}>Voltar</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Itens Agrupados ({agrupado.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {agrupado.map(i => (
                <div key={i.id} className="flex justify-between items-center p-2 bg-white rounded-lg border">
                  <div>
                    <div className="font-medium">{i.nome}</div>
                    <div className="text-sm text-gray-500">{i.categoria}</div>
                  </div>
                  <div className="text-sm font-medium">{i.quantidade.toFixed(3)} {i.unidade}</div>
                </div>
              ))}
              {agrupado.length === 0 && <div className="text-gray-500">Nenhum item encontrado para o mês</div>}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
