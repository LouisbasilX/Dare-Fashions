'use server'

import { createClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'
import templates from '@/lib/emailTemplates.json'
import { getVideoThumbnailUrl } from '@/lib/cloudinary-helpers'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Get up to 5 most recent products with name, image_url, and video_url
async function getRecentProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('name, image_url, video_url')
    .eq('deleted', false)
    .order('created_at', { ascending: false })
    .limit(5)
  if (error) throw error
  return data // array of { name, image_url, video_url }
}

export async function sendNewsletter({
  templateId,
  expiryDate,
}: {
  templateId: number
  expiryDate?: string
}) {
  const supabase = await createClient()

  // 1. Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: customer } = await supabase
    .from('customers')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!customer || customer.role !== 'admin') throw new Error('Unauthorized')

  // 2. Fetch all subscribers
  const { data: subscribers, error } = await supabase
    .from('subscribers')
    .select('email')
  if (error) throw error

  let emails = subscribers.map(s => s.email)
  if (emails.length === 0) {
    return { success: false, message: 'No subscribers found.' }
  }

  // 3. If more than 100, pick a random 100
  if (emails.length > 100) {
    for (let i = emails.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [emails[i], emails[j]] = [emails[j], emails[i]];
    }
    emails = emails.slice(0, 100)
  }

  // 4. Get recent products (with images/videos)
  const recentProducts = await getRecentProducts()
  if (recentProducts.length === 0) {
    return { success: false, message: 'No products available for placeholder.' }
  }

  // 5. Find the selected template
  const template = templates.find(t => t.id === templateId)
  if (!template) throw new Error('Template not found')

  // 6. Send emails – each gets a random product with its image (or video thumbnail)
  const results = []
  for (const recipient of emails) {
    const randomProduct = recentProducts[Math.floor(Math.random() * recentProducts.length)]
    const productName = randomProduct.name

    // Determine image source: use image_url, or generate thumbnail from video_url, or fallback to logo
    let imageSrc = randomProduct.image_url
    if (!imageSrc && randomProduct.video_url) {
      imageSrc = getVideoThumbnailUrl(randomProduct.video_url, { width: 400, height: 400, time: 2 })
    }
    // If still no image, use your brand logo (assume you have a logo in public folder)
    const fallbackImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png` // adjust if logo is elsewhere
    const imageHtml = imageSrc
      ? `<div style="text-align: center; margin: 20px 0;">
          <img src="${imageSrc}" alt="${productName}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        </div>`
      : `<div style="text-align: center; margin: 20px 0;">
          <img src="${fallbackImageUrl}" alt="RP Apparels" style="max-width: 150px; height: auto; border-radius: 8px;">
        </div>`

    let body = template.body
      .replace(/\{\{product_name\}\}/g, productName)
      .replace(/\{\{discount_code\}\}/g, '')
      .replace(/\{\{expiry_date\}\}/g, expiryDate || '')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #faf7f4; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #D4AF37, #7A1E2C); padding: 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
          .content { padding: 30px; color: #1a1a1a; line-height: 1.6; }
          .button { display: inline-block; background-color: #D4AF37; color: #7f2c2c; padding: 12px 30px; border-radius: 30px; text-decoration: none; font-weight: bold; margin-top: 20px; }
          .footer { background-color: #f9f9f9; padding: 20px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RP APPARELS</h1>
          </div>
          <div class="content">
            ${imageHtml}
            ${body.replace(/\n/g, '<br>')}
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shop?new=true" class="button">Shop New Arrivals</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} RP Apparels. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `

    try {
      await transporter.sendMail({
        from: `"RP Apparels" <${process.env.GMAIL_USER}>`,
        to: recipient,
        subject: template.subject,
        html: htmlContent,
      })
      results.push({ email: recipient, status: 'sent' })
    } catch (err) {
      console.error(`Failed to send to ${recipient}:`, err)
      results.push({ email: recipient, status: 'failed' })
    }
  }

  const sentCount = results.filter(r => r.status === 'sent').length
  const failedCount = results.filter(r => r.status === 'failed').length

  return {
    success: true,
    message: `Sent to ${sentCount} subscriber(s)${failedCount > 0 ? `, ${failedCount} failed` : ''}.`,
    sent: sentCount,
    failed: failedCount,
  }
}