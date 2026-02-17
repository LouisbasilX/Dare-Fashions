'use client'

import { useState } from 'react'
import { BasketWithItems } from '@/lib/types'
import OrderModal from './OrderModal'

interface BasketActionsProps {
  basket: BasketWithItems
  total: number
  isValid: boolean
}

export default function BasketActions({ basket, total, isValid }: BasketActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!isValid) {
    return (
      <button
        disabled
        className="mt-4 bg-gray-400 text-white px-6 py-3 rounded cursor-not-allowed"
      >
        Basket Invalid – Adjust Quantities
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-4 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
      >
        Order via WhatsApp
      </button>
      <OrderModal
        basket={basket}
        total={total}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}