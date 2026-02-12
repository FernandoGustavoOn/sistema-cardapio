export function generateStaticParams() {
  const datas = []
  const hoje = new Date()
  
  // Gera 30 dias no passado
  for (let i = 30; i > 0; i--) {
    const data = new Date(hoje)
    data.setDate(data.getDate() - i)
    for (let id = 1; id <= 100; id++) {
      datas.push({
        id: id.toString(),
        data: data.toISOString().split('T')[0]
      })
    }
  }
  
  // Gera 60 dias no futuro
  for (let i = 0; i < 60; i++) {
    const data = new Date(hoje)
    data.setDate(data.getDate() + i)
    for (let id = 1; id <= 100; id++) {
      datas.push({
        id: id.toString(),
        data: data.toISOString().split('T')[0]
      })
    }
  }
  
  return datas
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}