'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Utensils } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('auth', 'true')
      router.push('/dashboard')
    } else {
      setError('Usuário ou senha incorretos')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Utensils className="w-8 h-8 text-primary-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Sistema de Planejamento
          </CardTitle>
          <p className="text-gray-500 mt-2">Gestão de Cardápios Empresariais</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuário
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" size="lg">
              Entrar
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Use: admin / admin
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
