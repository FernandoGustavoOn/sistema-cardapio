import { Suspense } from 'react'
import ComprasClient from './ComprasClient'

export const dynamicParams = true

export async function generateStaticParams() {
  const ids = Array.from({ length: 100 }, (_, i) => String(i + 1))
  return ids.map((id) => ({ id }))
}

export default function ComprasPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <ComprasClient empresaId={String(params.id)} />
    </Suspense>
  )
}