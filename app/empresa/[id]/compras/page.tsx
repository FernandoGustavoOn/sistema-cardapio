import { Suspense } from 'react'
import ComprasClient from './ComprasClient'

export const dynamic = 'force-dynamic'

export default function ComprasPage({ params, searchParams }: { params: { id: string }, searchParams: { mes?: string, ano?: string } }) {
  const empresaId = String(params.id)
  const hoje = new Date()
  const mes = searchParams?.mes ? parseInt(String(searchParams.mes)) - 1 : hoje.getMonth()
  const ano = searchParams?.ano ? parseInt(String(searchParams.ano)) : hoje.getFullYear()

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <ComprasClient empresaId={empresaId} mes={mes} ano={ano} />
    </Suspense>
  )
}
