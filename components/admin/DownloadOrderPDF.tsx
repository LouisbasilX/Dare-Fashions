'use client'

import jsPDF from 'jspdf'
import autoTable, { type CellHookData } from 'jspdf-autotable'

interface OrderItem {
  product_name: string
  quantity: number
  price_at_time: number
  subtotal: number
  image_url?: string | null
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

// Helper: fetch image and convert to base64 thumbnail
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

// Format price with "N" prefix and comma thousands
const formatNaira = (amount: number) => `N ${amount.toLocaleString()}`

export default function DownloadOrderPDF({ order }: { order: Order }) {
  const generatePDF = async () => {
    const doc = new jsPDF()
    let y = 20

    // Title
    doc.setFontSize(18)
    doc.text(`Order #${order.id.slice(0, 8)}`, 14, y)
    y += 10

    // Customer details
    doc.setFontSize(11)
    doc.text(`Customer: ${order.customer_name || 'N/A'}`, 14, y); y += 6
    doc.text(`Phone: ${order.phone || 'N/A'}`, 14, y); y += 6
    doc.text(`State: ${order.state || 'N/A'}`, 14, y); y += 6
    doc.text(`Paid: ${new Date(order.paid_at).toLocaleString()}`, 14, y); y += 6
    doc.text(`Delivered: ${order.delivered_at ? new Date(order.delivered_at).toLocaleDateString() : 'Pending'}`, 14, y); y += 10

    // Build table rows
    const rows = []
    for (const item of order.items) {
      const imgData = await getBase64Image(item.image_url)
      rows.push([
        { content: item.product_name, styles: { cellWidth: 30 } }, // product column width 30mm
        item.quantity.toString(),
        formatNaira(item.price_at_time),
        formatNaira(item.subtotal),
        { content: '', image: imgData, imageUrl: item.image_url }
      ])
    }

    autoTable(doc, {
      head: [['Product', 'Qty', 'Price (N)', 'Subtotal (N)', 'Image & Link']],
      body: rows as any,
      startY: y,
      styles: {
        fontSize: 8,
        cellPadding: { top: 2, right: 2, bottom: 15, left: 2 },
        valign: 'top',
        overflow: 'linebreak'
      },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
        0: { cellWidth: 30, overflow: 'linebreak' }, // product: 30mm (~20 chars, wraps)
        1: { cellWidth: 10, halign: 'center' },      // qty: 10mm (4 chars)
        2: { cellWidth: 15, halign: 'right' },       // price: 15mm (7 chars + N)
        3: { cellWidth: 15, halign: 'right' },       // subtotal: 15mm
        4: { cellWidth: 45 }                          // image column: 45mm
      },
      minCellHeight: 25,
      didDrawCell: (data: CellHookData) => {
        if (data.column.index === 4 && data.cell.section === 'body') {
          const cellData = data.cell.raw as any
          const imgData = cellData?.image
          const imageUrl = cellData?.imageUrl

          // Draw image at top-left
          if (imgData) {
            doc.addImage(imgData, 'JPEG', data.cell.x + 2, data.cell.y + 2, 12, 12)
          }

          // Draw clickable URL at bottom of cell
          if (imageUrl) {
            doc.setFontSize(6)
            doc.setTextColor(0, 0, 255)
            const displayUrl = imageUrl.length > 35 ? imageUrl.slice(0, 32) + '...' : imageUrl
            const textX = data.cell.x + 2
            const textY = data.cell.y + data.cell.height - 5
            doc.text(displayUrl, textX, textY, { maxWidth: data.cell.width - 4 })

            const textWidth = doc.getTextWidth(displayUrl)
            const textHeight = 2.5 // ~6pt
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

    const finalY = (doc as any).lastAutoTable.finalY + 5
    doc.setFontSize(11)
    doc.text(`Total: ${formatNaira(order.total)}`, 14, finalY)

    doc.save(`order_${order.id.slice(0, 8)}.pdf`)
  }

  return (
    <button
      onClick={generatePDF}
      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
    >
      Download PDF
    </button>
  )
}