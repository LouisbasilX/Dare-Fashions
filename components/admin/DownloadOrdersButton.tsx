'use client'

interface Order {
  id: string
  customer_name: string | null
  phone: string | null
  state: string | null
  total: number
  paid_at: string
  delivered_at: string | null
  items: any[]
}

export default function DownloadOrdersButton({ orders }: { orders: Order[] }) {
  const downloadCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Phone', 'State', 'Total', 'Paid At', 'Delivered At']
    const rows = orders.map(o => [
      o.id,
      o.customer_name || '',
      o.phone || '',
      o.state || '',
      o.total.toString(),
      new Date(o.paid_at).toLocaleString(),
      o.delivered_at ? new Date(o.delivered_at).toLocaleString() : ''
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={downloadCSV}
      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
    >
      Download CSV Report
    </button>
  )
}