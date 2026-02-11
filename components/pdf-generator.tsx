import React from 'react'

export default function PdfGenerator({ content }: { content: string }) {
  const handleExport = () => {
    const blob = new Blob([content], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'relatorio.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  return <button onClick={handleExport}>Exportar PDF (simulado)</button>
}
