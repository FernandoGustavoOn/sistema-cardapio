'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocalStorage } from '@/lib/hooks/useStorage'
import { Empresa } from '@/lib/types'
import { empresasIniciais } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Plus, LogOut, Calendar, ChevronRight } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [empresas, setEmpresas] = useLocalStorage<Empresa[]>('empresas', empresasIniciais)

  useEffect(() => {
    const auth = localStorage.getItem('auth')
    if (!auth) {
      router.push('/')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('auth')
    router.push('/')
  }

  const adicionarEmpresa = () => {
  const nome = prompt('Nome da nova empresa:')
  if (nome) {
    // Encontra o próximo ID sequencial
    const maxId = empresas.reduce((max, e) => {
      const idNum = parseInt(e.id)
      return idNum > max ? idNum : max
    }, 0)
    
    const novaEmpresa: Empresa = {
      id: (maxId + 1).toString(),  // ← ID sequencial: 1, 2, 3...
      nome,
      dias: []
    }
    setEmpresas([...empresas, novaEmpresa])
  }
}

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={() => router.push('/admin/alimentos')}>
              Gerenciar Alimentos
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Empresas</h2>
            <p className="text-gray-500">Selecione uma empresa para gerenciar o cardápio</p>
          </div>
          <Button onClick={adicionarEmpresa}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Empresa
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresas.map((empresa) => (
            <Card key={empresa.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/empresa/${empresa.id}`)}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary-600" />
                  {empresa.nome}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {empresa.dias.length} dias planejados
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
