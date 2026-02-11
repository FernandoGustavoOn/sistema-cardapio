import React from 'react'
import Modal from './ui/modal'

export default function CardapioModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <Modal onClose={onClose}>
      <h3>Montar Cardápio</h3>
      <p>Formulário de montagem do cardápio do dia.</p>
    </Modal>
  )
}
