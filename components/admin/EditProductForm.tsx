'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateProduct, uploadProductImage, uploadProductVideo, deleteCloudinaryFile } from '@/actions/admin'
import type { Product, ProductUpdate } from '@/lib/types'
import CatalogSelector from './CatalogSelector'
import Image from 'next/image'
import { BookOpen } from 'lucide-react'

export default function EditProductForm({ product }: { product: Product }) {
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description || '')
  const [price, setPrice] = useState(product.price.toString())
  const [stock, setStock] = useState(product.stock.toString())
  const [sex, setSex] = useState(product.sex || 'men')
  const [catalogOpen, setCatalogOpen] = useState(false)
  // Image & video states
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(product.image_url || null)
  const [videoFileName, setVideoFileName] = useState<string | null>(null)

  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setImageFile(null)
      setImagePreview(product.image_url || null)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setVideoFile(file || null)
    setVideoFileName(file ? file.name : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const priceNum = parseInt(price, 10)
    const stockNum = parseInt(stock, 10)

    if (isNaN(priceNum) || isNaN(stockNum)) {
      setError('Price and stock must be numbers')
      setLoading(false)
      return
    }

    // Validate file sizes if new files are selected
    if (imageFile && imageFile.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB')
      setLoading(false)
      return
    }
    if (videoFile && videoFile.size > 3 * 1024 * 1024) {
      setError('Video must be less than 3MB')
      setLoading(false)
      return
    }

    let imageUrl = product.image_url
    let videoUrl = product.video_url
    let oldImageUrl = product.image_url
    let oldVideoUrl = product.video_url

    // Upload new image if provided
    if (imageFile) {
      setUploadingImage(true)
      try {
        const imageFormData = new FormData()
        imageFormData.append('image', imageFile)
        const { publicUrl } = await uploadProductImage(imageFormData)
        imageUrl = publicUrl ?? null
      } catch (err: any) {
        setError(err.message || 'Image upload failed')
        setUploadingImage(false)
        setLoading(false)
        return
      }
      setUploadingImage(false)
    }

    // Upload new video if provided
    if (videoFile) {
      setUploadingVideo(true)
      try {
        const videoFormData = new FormData()
        videoFormData.append('video', videoFile)
        const { publicUrl } = await uploadProductVideo(videoFormData)
        videoUrl = publicUrl ?? null
      } catch (err: any) {
        setError(err.message || 'Video upload failed')
        setUploadingVideo(false)
        setLoading(false)
        return
      }
      setUploadingVideo(false)
    }

    const updates: ProductUpdate = {
      name,
      description: description || null,
      price: priceNum,
      stock: stockNum,
      sex,
      image_url: imageUrl,
      video_url: videoUrl,
    }

    try {
      await updateProduct(product.id, updates)

      // After successful update, delete old files if they were replaced
      if (imageFile && oldImageUrl) {
        await deleteCloudinaryFile(oldImageUrl)
      }
      if (videoFile && oldVideoUrl) {
        await deleteCloudinaryFile(oldVideoUrl)
      }

      alert('Product updated')
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1e1e1e] p-4 rounded shadow border border-gray-200 dark:border-gray-700 max-w-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Edit Product</h2>
      {error && <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 p-3 rounded mb-4">{error}</div>}

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2 mb-2"
      />
      <div className="flex justify-end mb-2">
  <button
    type="button"
    onClick={() => setCatalogOpen(true)}
    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
  >
    <BookOpen className="w-4 h-4" />
    Browse Catalog
  </button>
        </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={3}
        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2 mb-2"
      />

      <div className="grid grid-cols-2 gap-2 mb-2">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          required
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2"
        />
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Stock"
          required
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2"
        />
      </div>

      {/* Sex dropdown */}
      <select
        value={sex}
        onChange={(e) => setSex(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-3 py-2 mb-2"
        required
      >
        <option value="men">Men</option>
        <option value="women">Women</option>
        <option value="unisex">Unisex</option>
      </select>

      {/* Image upload */}
      <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-blue-500 transition mb-2">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-blue-600 dark:text-blue-400">Click to replace image</span> (optional)
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {imagePreview && (
          <div className="mt-2 relative h-20 w-20 mx-auto">
            <Image src={imagePreview} alt="Preview" fill className="object-cover rounded" />
          </div>
        )}
      </div>

      {/* Video upload */}
      <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-purple-500 transition mb-4">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M15 10l4.553-2.276A2 2 0 0122 9.618V18m-7 0h7m0 0v7a4 4 0 01-4 4h-6a4 4 0 01-4-4v-6a4 4 0 014-4h6z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M30 14l8 8m0-8l-8 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-purple-600 dark:text-purple-400">Click to add/replace video</span> (optional)
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">MP4, WebM, etc. Max 3MB</p>
          {videoFileName && (
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">Selected: {videoFileName}</p>
          )}
          {product.video_url && !videoFile && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Current video exists</p>
          )}
        </div>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || uploadingImage || uploadingVideo}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded transition"
        >
          {uploadingImage ? 'Uploading image...' : uploadingVideo ? 'Uploading video...' : loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Cancel
        </button>
      </div>
    </form>
    <CatalogSelector
      isOpen={catalogOpen}
      onClose={() => setCatalogOpen(false)}
      onSelect={(name, description) => {
        setName(name)
        setDescription(description)
      }}
    />
    </>
  )
}