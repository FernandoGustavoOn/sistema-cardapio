import React from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header style={{ padding: 10, borderBottom: '1px solid #ddd' }}>
        <h2>Dashboard</h2>
      </header>
      <section style={{ padding: 20 }}>{children}</section>
    </div>
  )
}
