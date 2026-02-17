import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">About RP Apparels</h1>
      <div className="prose dark:prose-invert">
        <p>
          RP Apparels was founded with a simple mission: to provide high‑quality, stylish clothing
          that fits the modern Nigerian lifestyle. We believe that fashion should be accessible,
          comfortable, and sustainable.
        </p>
        <p>
          Our team carefully selects materials and works with trusted manufacturers to ensure every
          piece meets our standards. From casual wear to formal attire, we've got you covered.
        </p>
        <p>
          We're committed to excellent customer service and fast delivery across Nigeria.
          Thank you for choosing RP Apparels!
        </p>
      </div>
      <div className="mt-8">
        <Link
          href="/shop"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  )
}