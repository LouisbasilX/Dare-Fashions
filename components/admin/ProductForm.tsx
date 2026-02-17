'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadProductImage } from '@/actions/admin'
import type { ProductInsert } from '@/lib/types'

export default function ProductForm() {
  const [uploading, setUploading] = useState(false)
  const [inserting, setInserting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)

    const formData = new FormData(e.currentTarget)

    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const price = parseInt(formData.get('price') as string, 10)
    const stock = parseInt(formData.get('stock') as string, 10)
    const file = formData.get('image') as File

    if (!name || isNaN(price) || isNaN(stock)) {
      setFormError('Please fill all required fields correctly.')
      return
    }

    let imageUrl: string | null = ''

    if (file && file.size > 0) {
      setUploading(true)
      try {
        const { publicUrl } = await uploadProductImage(formData)
        imageUrl = publicUrl ?? ''
      } catch (error) {
        console.error('Cloudinary upload failed:', error)
        setFormError('Image upload failed. Please try again.')
        setUploading(false)
        return
      }
      setUploading(false)
    }

    const newProduct: ProductInsert = {
      name,
      description: description || null,
      price,
      stock,
      available: stock,
      image_url: imageUrl || null,
    }

    setInserting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('products').insert(newProduct)
      if (error) throw error
      alert('Product added successfully!')
      window.location.reload()
    } catch (error: any) {
      setFormError(`Database error: ${error.message || 'Unknown error'}`)
    } finally {
      setInserting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1e1e1e] p-4 rounded shadow border border-gray-200 dark:border-gray-700 max-w-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add New Product</h2>
      {formError && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
          {formError}
        </div>
      )}
      <input
        name="name"
        placeholder="Name"
        required
        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2 mb-2"
      />
      <textarea
        name="description"
        placeholder="Description"
        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2 mb-2"
      />
      <input
        name="price"
        type="number"
        placeholder="Price"
        required
        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2 mb-2"
      />
      <input
        name="stock"
        type="number"
        placeholder="Stock"
        required
        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2 mb-2"
      />
      <input
        name="image"
        type="file"
        accept="image/*"
        className="w-full mb-2 text-gray-700 dark:text-gray-300"
      />
      <button
        type="submit"
        disabled={uploading || inserting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded transition"
      >
        {uploading ? 'Uploading...' : inserting ? 'Saving...' : 'Add Product'}
      </button>
    </form>
  )
}