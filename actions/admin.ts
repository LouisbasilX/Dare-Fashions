// actions/admin.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { v2 as cloudinary } from 'cloudinary'
import type { ProductUpdate } from '@/lib/types'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// Helper to verify admin
async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: customer } = await supabase
    .from('customers')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!customer || customer.role !== 'admin') throw new Error('Unauthorized')
  return user
}

// Mark baskets as paid
export async function markBasketsPaid(basketIds: string[]) {
  await verifyAdmin()
  const adminClient = createAdminClient()
  const { error } = await adminClient.rpc('mark_baskets_paid', { basket_ids: basketIds })
  if (error) throw error

  // After RPC, fetch the updated status of the baskets
  const { data: baskets, error: fetchError } = await adminClient
    .from('baskets')
    .select('id, status')
    .in('id', basketIds)

  if (fetchError) throw fetchError

  const paid = baskets?.filter(b => b.status === 'paid').map(b => b.id) || []
  const skipped = basketIds.filter(id => !paid.includes(id))

  revalidatePath('/admin/baskets')
  return { paid, skipped }
}

// Upload product image to Cloudinary
// actions/admin.ts - enhanced upload with AI enhancement

export async function uploadProductImage(formData: FormData, enhanceImage = false) {
  try {
    await verifyAdmin()
    const file = formData.get('image') as File | null
    if (!file || file.size === 0) return { publicUrl: null }

    // Enforce max 5MB
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      throw new Error('Image must be less than 5MB')
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Explicitly type transformations as string array
    const transformations: string[] = []
    
    // Add AI enhancement if requested
    if (enhanceImage) {
      transformations.push('e_enhance') // Basic AI enhancement
    }

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'rp-apparels/products',
          resource_type: 'auto',
          // Pass transformations array only if not empty
          transformation: transformations.length > 0 ? transformations : undefined,
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })
    
    return { publicUrl: result.secure_url }
  } catch (error) {
    console.error('❌ uploadProductImage error:', error)
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Update product
export async function updateProduct(productId: string, updates: ProductUpdate) {
  await verifyAdmin()
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('products')
    .update(updates)
    .eq('id', productId)
  if (error) throw error
  revalidatePath('/admin/products')
  revalidatePath(`/product/${productId}`)
}

// Soft delete product
export async function softDeleteProduct(productId: string) {
  await verifyAdmin()
  const adminClient = createAdminClient()

  // Step 1: Soft delete the product
  const { error: deleteError } = await adminClient
    .from('products')
    .update({ deleted: true })
    .eq('id', productId)

  if (deleteError) throw deleteError

  // Step 2: Find all pending/invalid baskets that contain this product
  const { data: basketItems, error: itemsError } = await adminClient
    .from('basket_items')
    .select('basket_id')
    .eq('product_id', productId)

  if (itemsError) throw itemsError

  if (basketItems && basketItems.length > 0) {
    const basketIds = basketItems.map(item => item.basket_id)

    // Step 3: Mark those baskets as invalid (if they are pending or already invalid)
    const { error: updateError } = await adminClient
      .from('baskets')
      .update({ status: 'invalid' })
      .in('id', basketIds)
      .in('status', ['pending', 'invalid'])

    if (updateError) throw updateError
  }

  revalidatePath('/admin/products')
  revalidatePath('/product')
  revalidatePath('/admin/baskets')
}
export async function markOrdersDelivered(orderIds: string[]) {
  await verifyAdmin()
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('orders')
    .update({ delivered_at: new Date().toISOString() })
    .in('id', orderIds)

  if (error) throw error

  revalidatePath('/admin/orders')
}
export async function updateUserRole(userId: string, newRole: string) {
  await verifyAdmin()
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('customers')
    .update({ role: newRole })
    .eq('id', userId)
  if (error) throw error
  revalidatePath('/admin/users')
}

export async function sendPasswordReset(email: string) {
  await verifyAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email,
  })
  if (error) throw error
  // In production, you'd send the email via Supabase's built-in email service.
  // This action is just to trigger the email – Supabase will send it.
}

export async function uploadProductVideo(formData: FormData) {
  try {
    await verifyAdmin()
    const file = formData.get('video') as File | null
    if (!file || file.size === 0) return { publicUrl: null }

    // Enforce max 3MB
    const MAX_SIZE = 10 * 1024 * 1024 // 3MB in bytes
    if (file.size > MAX_SIZE) {
      throw new Error('Video file must be less than 3MB')
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'rp-apparels/products/videos',
          resource_type: 'video',        // required for video files
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    return { publicUrl: result.secure_url }
  } catch (error) {
    console.error('❌ uploadProductVideo error:', error)
    throw new Error(`Video upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// actions/admin.ts

// ... (keep existing imports and config)

/**
 * Delete a file from Cloudinary given its URL
 * Returns true if successful, false if file not found or error
 */
export async function deleteCloudinaryFile(fileUrl: string) {
  try {
    await verifyAdmin() // ensure only admin can delete

    // Extract public ID from Cloudinary URL
    // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/public_id.jpg
    const urlParts = fileUrl.split('/')
    const versionIndex = urlParts.findIndex(part => part.startsWith('v'))
    if (versionIndex === -1) return false

    const publicIdWithExtension = urlParts.slice(versionIndex + 1).join('/')
    const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.')) // remove extension

    // Determine resource type (image or video) from URL path
    const resourceType = fileUrl.includes('/video/') ? 'video' : 'image'

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
    return result.result === 'ok'
  } catch (error) {
    console.error('❌ deleteCloudinaryFile error:', error)
    return false
  }
}

// actions/admin.ts (updated action)
export async function updateAdminSocialSettings(settings: {
  admin_whatsapp_number?: string
  admin_x_handle?: string
  admin_tiktok_handle?: string
  admin_instagram_handle?: string
  admin_email?: string
}) {
  await verifyAdmin()
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('global_settings')
    .update(settings)
    .eq('id', 1)

  if (error) throw error
  revalidatePath('/admin/settings')
}