export function generateStaticParams() {
  // Gera IDs de 1 a 100 para suportar novas empresas
  return Array.from({ length: 100 }, (_, i) => ({
    id: (i + 1).toString()
  }))
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}