'use client'

import { useEffect, useState, useCallback } from 'react'
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
  endOfWeek
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function CalendarioPage() {
  const router = useRouter()
  const params = useParams()
  const empresaId = String(params.id)

  const [empresas, setEmpresas] = useLocalStorage<Empresa[]>('empresas', empresasIniciais)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isClient, setIsClient] = useState(false)

  // ✅ HOOKS SEMPRE NO TOPO — antes de qualquer return
  const handleDiaClick = useCallback((day: Date) => {
    const dataStr = format(day, 'yyyy-MM-dd')
    router.push(`/empresa/${empresaId}/cardapio/${dataStr}`)
  }, [router, empresaId])

  const handleRelatorioClick = useCallback(() => {
    router.push(`/relatorio/${empresaId}`)
  }, [router, empresaId])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const empresa = empresas.find(e => String(e.id) === empresaId)

  useEffect(() => {
    const auth = localStorage.getItem('auth')
    if (!auth) {
      router.push('/')
    }
  }, [router])

  // ✅ agora pode ter return condicional
  if (!isClient) {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Empresa não encontrada
          </h1>
          <Button onClick={() => router.push('/dashboard')}>
            Voltar para Dashboard
          </Button>
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
    return empresa.dias.find(d => d.data === dataStr)
  }

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  return (
    // 👉 resto do seu JSX igual
    <div className="min-h-screen bg-gray-50">
      {/* ... seu código continua igual */}
    </div>
  )
}
