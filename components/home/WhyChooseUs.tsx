import { Check } from 'lucide-react'

const reasons = [
  'Premium quality fabrics',
  'Affordable luxury',
  'Trend-forward collections',
  'Flattering fits for confident women',
  'Excellent customer service',
  'Nationwide delivery',
]

export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-[#F2C6C2] dark:bg-[#2A2A2A]">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">Why Everyone Loves RP APPARELS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-8">
          {reasons.map((reason, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="bg-[#7A1E2C] dark:bg-[#B84A5A] rounded-full p-1">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-800 dark:text-gray-200">{reason}</span>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-lg italic text-gray-700 dark:text-gray-300">
          “We don’t just sell outfits. We deliver confidence.”
        </p>
      </div>
    </section>
  )
}