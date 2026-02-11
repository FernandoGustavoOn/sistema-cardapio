export function generateStaticParams() {
  return [
    { empresaId: '1' },
    { empresaId: '2' }
  ]
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}