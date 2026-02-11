import React from 'react'

export default function Modal({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)' }}>
      <div style={{ background: '#fff', margin: '5% auto', padding: 20, width: 600 }}>
        <button onClick={onClose} style={{ float: 'right' }}>Fechar</button>
        {children}
      </div>
    </div>
  )
}
