'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { softDeleteProduct } from '@/actions/admin'

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string
  productName: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${productName}"? It will be hidden from customers.`))
      return
    setLoading(true)
    try {
      await softDeleteProduct(productId)
      alert('Product deleted')
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-800 disabled:text-gray-400"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}