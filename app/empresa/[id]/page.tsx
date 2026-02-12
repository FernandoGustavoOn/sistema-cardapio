'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLocalStorage } from '@/lib/hooks/useStorage'
import { Empresa, DiaCardapio } from '@/lib/types'
import { empresasIniciais } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ChevronLeft, ChevronRight, FileText, Plus } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function CalendarioPage() {
  const router = useRouter()
  const params = useParams()
  const empresaId = String(params.id)

  const [empresas, setEmpresas, empresasReady] = useLocalStorage<Empresa[]>(
    'empresas',
    empresasIniciais
  )

  const [currentDate, setCurrentDate] = useState(new Date())

  // ✅ Hooks SEMPRE no topo
  useEffect(() => {
    const auth = localStorage.getItem('auth')
    if (!auth) router.push('/')
  }, [router])

  const handleDiaClick = useCallback(
    (day: Date) => {
      const dataStr = format(day, 'yyyy-MM-dd')
      router.push(`/empresa/${empresaId}/cardapio/${dataStr}`)
    },
    [router, empresaId]
  )

  const handleRelatorioClick = useCallback(() => {
    router.push(`/relatorio/${empresaId}`)
  }, [router, empresaId])

  // ✅ useMemo precisa ficar ANTES de qualquer return
  const empresa = useMemo(
    () => empresas.find((e) => String(e.id) === empresaId),
    [empresas, empresaId]
  )

  // ✅ Agora sim: returns condicionais
  if (!empresasReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Carregando...
      </div>
    )
  }

  if (!empresa) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Empresa não encontrada</h1>
          <Button onClick={() => router.push('/dashboard')}>Voltar para Dashboard</Button>
        </div>
      </div>
    )
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const getDiaCardapio = (date: Date): DiaCardapio | undefined => {
    const dataStr = format(date, 'yyyy-MM-dd')
    return empresa.dias.find((d) => d.data === dataStr)
  }

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{empresa.nome}</h1>
              <p className="text-sm text-gray-500">Planejamento Mensal</p>
            </div>
          </div>

          <Button onClick={handleRelatorioClick} variant="secondary">
            <FileText className="w-4 h-4 mr-2" />
            Relatório Mensal
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </CardTitle>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => {
                const diaCardapio = getDiaCardapio(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isTodayDate = isToday(day)
                const hasCardapio = !!diaCardapio

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDiaClick(day)}
                    className={`
                      min-h-[100px] p-2 rounded-lg border text-left transition-all hover:shadow-md
                      ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                      ${isTodayDate ? 'ring-2 ring-primary-500' : ''}
                      ${hasCardapio ? 'border-primary-300 bg-primary-50' : 'border-gray-200'}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-sm font-medium ${isTodayDate ? 'text-primary-600' : ''}`}>
                        {format(day, 'd')}
                      </span>

                      {hasCardapio && <div className="w-2 h-2 rounded-full bg-success-500" />}
                    </div>

                    {hasCardapio && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-600 font-medium">{diaCardapio.numeroPessoas} pessoas</p>
                        <p className="text-xs text-gray-500 truncate">{diaCardapio.itens.length} itens</p>
                      </div>
                    )}

                    {!hasCardapio && isCurrentMonth && (
                      <div className="mt-4 flex justify-center">
                        <Plus className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
