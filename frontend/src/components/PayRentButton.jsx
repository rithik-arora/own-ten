import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { paymentService } from '../services/paymentService'

/* LOAD RAZORPAY SCRIPT */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

const PayRentButton = ({ propertyId }) => {
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)

    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast.error('Razorpay SDK failed to load')
        setLoading(false)
        return
      }

      /* CREATE ORDER */
      const res = await paymentService.createOrder({
        propertyId,
        type: 'RENT'
      })

      const { orderId, amount, currency, razorpayKeyId } = res.data

      if (!orderId) {
        toast.error("Order creation failed")
        setLoading(false)
        return
      }

      /* RAZORPAY OPTIONS */
      const options = {
        key: razorpayKeyId,
        amount,
        currency,
        name: 'OwnTen',
        description: 'Rent Payment',
        order_id: orderId,

        handler: async (response) => {
          try {
            console.log("RAZORPAY RESPONSE:", response)

            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })

            toast.success('Payment successful & verified ✅')
          } catch (err) {
            console.log("VERIFY ERROR:", err.response?.data || err)
            toast.error(
              err.response?.data?.message ||
              "Verification API failed"
            )
          }
        },

        modal: {
          ondismiss: () => {
            console.log("Payment popup closed")
          }
        },

        theme: { color: '#6366f1' }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.log("CREATE ORDER ERROR:", err.response?.data || err)
      toast.error(
        err.response?.data?.message ||
        'Payment failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handlePay}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Pay Rent'
      )}
    </motion.button>
  )
}

export default PayRentButton