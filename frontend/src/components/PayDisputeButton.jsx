import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Loader2, AlertCircle } from 'lucide-react'
import { paymentService } from '../services/paymentService'

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

const PayDisputeFeeButton = ({ propertyId, disputeId }) => {
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)

    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast.error('Razorpay failed to load')
        return
      }

      const res = await paymentService.createOrder({
        propertyId,
        disputeId,
        type: 'DISPUTE_FEE'
      })

      const { orderId, amount, currency, razorpayKeyId } = res.data

      const options = {
        key: razorpayKeyId,
        amount,
        currency,
        name: 'OwnTen',
        description: 'Dispute Fee',
        order_id: orderId,

        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })

            toast.success('Dispute fee paid ✅')
          } catch {
            toast.error('Verification failed')
          }
        },

        theme: { color: '#ef4444' }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
        <AlertCircle size={16} className="text-indigo-400 flex-shrink-0" />
        <span>Dispute fee: <span className="font-semibold text-white">₹200</span></span>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePay}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay Dispute Fee'
        )}
      </motion.button>
    </div>
  )
}

export default PayDisputeFeeButton