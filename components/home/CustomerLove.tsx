import { Star } from 'lucide-react'

const reviews = [
  {
    name: 'Chioma',
    rating: 5,
    text: 'I absolutely love my dress! The quality is top-notch and it fits perfectly.',
  },
  {
    name: 'Ada',
    rating: 5,
    text: 'The customer service is amazing and delivery was super fast. Will definitely shop again!',
  },
  {
    name: 'Temilade',
    rating: 5,
    text: 'Every piece I’ve bought from RP has been stunning. My new go-to store.',
  },
]

export default function CustomerLove() {
  return (
    <section className="py-16 bg-[#FAF7F4] dark:bg-[#1A1A1A]">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {reviews.map((review, idx) => (
            <div key={idx} className="card p-6 text-center">
              <div className="flex justify-center mb-2">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 italic mb-4">"{review.text}"</p>
              <p className="font-semibold text-[#7A1E2C] dark:text-[#B84A5A]">— {review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}