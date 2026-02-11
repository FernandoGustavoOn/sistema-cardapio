'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLocalStorage } from '@/lib/hooks/useStorage'
import { Empresa, DiaCardapio } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ChevronLeft, ChevronRight, FileText, Plus } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function CalendarioPage() {
  const router = useRouter()
  const params = useParams()
  const [empresas, setEmpresas] = useLocalStorage<Empresa[]>('empresas', [])
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const empresa = empresas.find(e => e.id === params.id)

  useEffect(() => {
    const auth = localStorage.getItem('auth')
    if (!auth) {
      router.push('/')
    }
  }, [router])

  if (!empresa) {
    return <div>Empresa não encontrada</div>
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const getDiaCardapio = (date: Date): DiaCardapio | undefined => {
    const dataStr = format(date, 'yyyy-MM-dd')
    return empresa.dias.find(d => d.data === dataStr)
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
          <Button onClick={() => router.push(`/relatorio/${empresa.id}`)} variant="secondary">
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
              {weekDays.map(day => (
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
                  <div
                    key={idx}
                    onClick={() => router.push(`/empresa/${empresa.id}/cardapio/${format(day, 'yyyy-MM-dd')}`)}
                    className={`
                      min-h-[100px] p-2 rounded-lg border cursor-pointer transition-all hover:shadow-md
                      ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                      ${isTodayDate ? 'ring-2 ring-primary-500' : ''}
                      ${hasCardapio ? 'border-primary-300 bg-primary-50' : 'border-gray-200'}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-sm font-medium ${isTodayDate ? 'text-primary-600' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {hasCardapio && (
                        <div className="w-2 h-2 rounded-full bg-success-500" />
                      )}
                    </div>
                    {hasCardapio && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-600 font-medium">
                          {diaCardapio.numeroPessoas} pessoas
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {diaCardapio.itens.length} itens
                        </p>
                      </div>
                    )}
                    {!hasCardapio && isCurrentMonth && (
                      <div className="mt-4 flex justify-center">
                        <Plus className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
