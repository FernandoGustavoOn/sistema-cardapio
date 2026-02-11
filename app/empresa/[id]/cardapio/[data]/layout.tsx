export function generateStaticParams() {
  const datas = []
  const hoje = new Date()
  
  for (let i = 0; i < 30; i++) {
    const data = new Date(hoje)
    data.setDate(data.getDate() + i)
    datas.push({
      id: '1',
      data: data.toISOString().split('T')[0]
    })
    datas.push({
      id: '2', 
      data: data.toISOString().split('T')[0]
    })
  }
  
  return datas
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}