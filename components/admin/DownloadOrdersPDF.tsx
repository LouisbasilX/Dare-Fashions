'use client'

import jsPDF from 'jspdf'
import autoTable, { type CellHookData } from 'jspdf-autotable'
import { getVideoThumbnailUrl } from '@/lib/cloudinary-helpers'

interface OrderItem {
  product_name: string
  quantity: number
  price_at_time: number
  subtotal: number
  image_url?: string | null
  video_url?: string | null
}

interface Order {
  id: string
  customer_name: string | null
  phone: string | null
  state: string | null
  total: number
  paid_at: string
  delivered_at: string | null
  items: OrderItem[]
}

async function getBase64Image(url: string | null | undefined): Promise<string | null> {
  if (!url) return null
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

const formatNaira = (amount: number) => `N ${amount.toLocaleString()}`

export default function DownloadOrdersPDF({ orders }: { orders: Order[] }) {
  const generatePDF = async () => {
    const doc = new jsPDF()
    let yOffset = 20

    doc.setFontSize(18)
    doc.text('Orders Report', 14, yOffset)
    yOffset += 8
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yOffset)
    yOffset += 10

    if (orders.length === 0) {
      doc.text('No orders found.', 14, yOffset)
      doc.save('orders_report.pdf')
      return
    }

    for (const [orderIndex, order] of orders.entries()) {
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(`Order #${order.id.slice(0, 8)}`, 14, yOffset)
      yOffset += 5

      doc.setFontSize(10)
      doc.text(`Customer: ${order.customer_name || 'N/A'}`, 14, yOffset); yOffset += 5
      doc.text(`Phone: ${order.phone || 'N/A'}`, 14, yOffset); yOffset += 5
      doc.text(`State: ${order.state || 'N/A'}`, 14, yOffset); yOffset += 5
      doc.text(`Paid: ${new Date(order.paid_at).toLocaleString()}`, 14, yOffset); yOffset += 5
      doc.text(`Delivered: ${order.delivered_at ? new Date(order.delivered_at).toLocaleDateString() : 'Pending'}`, 14, yOffset); yOffset += 5

      if (order.items && order.items.length > 0) {
        const rows = []
        for (const item of order.items) {
          // Determine which image to display and which URL to link to
          let displayImageUrl = item.image_url
          let linkUrl = item.image_url

          // If no image but video exists, use video thumbnail for display and video URL for linking
          if (!displayImageUrl && item.video_url) {
            displayImageUrl = getVideoThumbnailUrl(item.video_url)
            linkUrl = item.video_url
          }

          const imgData = await getBase64Image(displayImageUrl)

          rows.push([
            { content: item.product_name, styles: { cellWidth: 30 } },
            item.quantity.toString(),
            formatNaira(item.price_at_time),
            formatNaira(item.subtotal),
            { content: '', image: imgData, imageUrl: linkUrl }
          ])
        }

        autoTable(doc, {
          head: [['Product', 'Qty', 'Price (N)', 'Subtotal (N)', 'Image & Link']],
          body: rows as any,
          startY: yOffset,
          styles: {
            fontSize: 8,
            cellPadding: { top: 2, right: 2, bottom: 15, left: 2 },
            valign: 'top',
            overflow: 'linebreak'
          },
          headStyles: { fillColor: [41, 128, 185] },
          columnStyles: {
            0: { cellWidth: 30, overflow: 'linebreak' },
            1: { cellWidth: 10, halign: 'center' },
            2: { cellWidth: 15, halign: 'right' },
            3: { cellWidth: 15, halign: 'right' },
            4: { cellWidth: 45 }
          },
          minCellHeight: 25,
          margin: { left: 14, right: 14 },
          didDrawCell: (data: CellHookData) => {
            if (data.column.index === 4 && data.cell.section === 'body') {
              const cellData = data.cell.raw as any
              const imgData = cellData?.image
              const imageUrl = cellData?.imageUrl

              if (imgData) {
                doc.addImage(imgData, 'JPEG', data.cell.x + 2, data.cell.y + 2, 12, 12)
              }

              if (imageUrl) {
                doc.setFontSize(6)
                doc.setTextColor(0, 0, 255)
                const displayUrl = imageUrl.length > 35 ? imageUrl.slice(0, 32) + '...' : imageUrl
                const textX = data.cell.x + 2
                const textY = data.cell.y + data.cell.height - 5
                doc.text(displayUrl, textX, textY, { maxWidth: data.cell.width - 4 })

                const textWidth = doc.getTextWidth(displayUrl)
                const textHeight = 2.5
                doc.link(
                  textX,
                  textY - textHeight,
                  textWidth,
                  textHeight,
                  { url: imageUrl }
                )
                doc.setTextColor(0, 0, 0)
              }
            }
          }
        } as any)

        yOffset = (doc as any).lastAutoTable.finalY + 5
      } else {
        doc.text('No items in this order.', 14, yOffset)
        yOffset += 5
      }

      doc.setFontSize(10)
      doc.text(`Order Total: ${formatNaira(order.total)}`, 14, yOffset)
      yOffset += 10

      if (orderIndex < orders.length - 1) {
        doc.line(14, yOffset - 5, 200, yOffset - 5)
      }

      if (yOffset > 270) {
        doc.addPage()
        yOffset = 20
      }
    }

    doc.save(`orders_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return (
    <button
      onClick={generatePDF}
      className="bg-(--burgundy-dark) text-white px-4 py-2 rounded hover:bg-(--burgundy)"
    >
      Download Detailed PDF Report
    </button>
  )
}