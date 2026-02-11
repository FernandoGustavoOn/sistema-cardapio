import React from 'react'

export default function Calendario({ empresaId }: { empresaId: string }) {
  const days = Array.from({ length: 30 }, (_, i) => i + 1)
  return (
    <div>
      <p>Calendário para a empresa: {empresaId}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
        {days.map(d => (
          <div key={d} style={{ border: '1px solid #ddd', padding: 8 }}>{d}</div>
        ))}
      </div>
    </div>
  )
}
