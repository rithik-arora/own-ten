import Razorpay from 'razorpay';

let razorpayInstance = null;

export const getRazorpay = () => {
  if (razorpayInstance) return razorpayInstance;

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
    throw new Error('Razorpay keys are not configured');
  }

  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
  });

  return razorpayInstance;
};

