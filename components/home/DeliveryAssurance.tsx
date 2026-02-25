import { Shield, Truck, Headphones, Package } from 'lucide-react'

const assurances = [
  { icon: Shield, text: 'Secure payment options' },
  { icon: Truck, text: 'Fast nationwide delivery' },
  { icon: Headphones, text: 'Responsive customer support' },
  { icon: Package, text: 'Easy order process' },
]

export default function DeliveryAssurance() {
  return (
    <section className="py-16 bg-white dark:bg-[#1e1e1e]">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">Shop With Confidence</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {assurances.map((item, idx) => (
            <div key={idx} className="text-center">
              <div className="inline-block p-3 bg-[#F2C6C2] dark:bg-[#4A2C2A] rounded-full mb-3">
                <item.icon className="w-6 h-6 text-[#7A1E2C] dark:text-[#B84A5A]" />
              </div>
              <p className="font-medium text-gray-800 dark:text-gray-200">{item.text}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-lg italic text-gray-600 dark:text-gray-400">
          Your satisfaction is our priority.
        </p>
      </div>
    </section>
  )
}