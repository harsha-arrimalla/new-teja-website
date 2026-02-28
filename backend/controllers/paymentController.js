const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100, // amount in the smallest currency unit (paise)
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).send('Some error occurred while creating order');
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Private
const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment is verified
            res.json({ message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createRazorpayOrder,
    verifyRazorpayPayment,
};
