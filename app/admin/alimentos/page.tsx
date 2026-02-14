'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocalStorage } from '@/lib/hooks/useStorage'
import { Alimento } from '@/lib/types'
import { alimentosIniciais } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

export default function AdminAlimentosPage() {
  const router = useRouter()
  const [alimentos, setAlimentos] = useLocalStorage<Alimento[]>('alimentos', alimentosIniciais)
  const [novoAlimento, setNovoAlimento] = useState<Partial<Alimento>>({
    categoria: 'grao',
    unidade: 'kg',
    proporcional: true
  })

  useEffect(() => {
    const auth = localStorage.getItem('auth')
    if (!auth) router.push('/')
  }, [router])

  const adicionarAlimento = () => {
    if (!novoAlimento.nome || !novoAlimento.quantidadePorPessoa) return
    
    const alimento: Alimento = {
      id: Date.now().toString(),
      nome: novoAlimento.nome!,
      categoria: novoAlimento.categoria as any,
      quantidadePorPessoa: novoAlimento.quantidadePorPessoa!,
      unidade: novoAlimento.unidade as any,
      proporcional: novoAlimento.proporcional ?? true
    }
    
    setAlimentos([...alimentos, alimento])
    setNovoAlimento({ categoria: 'grao', unidade: 'kg', proporcional: true })
  }

  const removerAlimento = (id: string) => {
    setAlimentos(alimentos.filter(a => a.id !== id))
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
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Gerenciar Alimentos</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Novo Alimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <Input
                  value={novoAlimento.nome || ''}
                  onChange={e => setNovoAlimento({...novoAlimento, nome: e.target.value})}
                  placeholder="Ex: Arroz Integral"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select
                  className="w-full h-10 rounded-lg border border-gray-300 px-3"
                  value={novoAlimento.categoria}
                  onChange={e => setNovoAlimento({...novoAlimento, categoria: e.target.value as any})}
                >
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Qtd/Pessoa</label>
                  <Input
                    type="number"
                    step="0.001"
                    value={novoAlimento.quantidadePorPessoa || ''}
                    onChange={e => setNovoAlimento({...novoAlimento, quantidadePorPessoa: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unidade</label>
                  <select
                    className="w-full h-10 rounded-lg border border-gray-300 px-3"
                    value={novoAlimento.unidade}
                    onChange={e => setNovoAlimento({...novoAlimento, unidade: e.target.value as any})}
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="unidade">unidade</option>
                    <option value="litro">litro</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="proporcional"
                  checked={novoAlimento.proporcional}
                  onChange={e => setNovoAlimento({...novoAlimento, proporcional: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="proporcional" className="text-sm">Proporcional ao número de pessoas</label>
              </div>

              <Button onClick={adicionarAlimento} className="w-full">
                Adicionar Alimento
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Alimentos Cadastrados ({alimentos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categorias.map(cat => {
                  const alimentosCat = alimentos.filter(a => a.categoria === cat.id)
                  if (alimentosCat.length === 0) return null

                  return (
                    <div key={cat.id} className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-2">{cat.nome}</h3>
                      <div className="space-y-2">
                        {alimentosCat.map(alimento => (
                          <div key={alimento.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{alimento.nome}</p>
                              <p className="text-sm text-gray-500">
                                {alimento.quantidadePorPessoa} {alimento.unidade}/pessoa
                                {alimento.proporcional ? ' (proporcional)' : ' (fixo)'}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerAlimento(alimento.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
