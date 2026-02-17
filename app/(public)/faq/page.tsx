export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">First Come, First Serve Policy</h2>
          <p className="mt-2">Products are reserved only when a basket is marked <strong>Paid</strong>. Available quantity decreases only at that moment. Your basket may become invalid if another customer pays for the same product before you.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">How do I know if my basket is valid?</h2>
          <p className="mt-2">On your basket page, items that exceed available stock are highlighted in red. The basket status will show as "Invalid". You must adjust quantities before sending your order.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Do I need an account?</h2>
          <p className="mt-2">No account required. Your basket is saved via a cookie on your device. You can share the basket link with us via WhatsApp.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">How do I place an order?</h2>
          <p className="mt-2">Add items to your basket, ensure it's valid, then click the WhatsApp button. This sends us your order with a link to your basket. We'll confirm availability and payment details.</p>
        </div>
      </div>
    </div>
  )
}