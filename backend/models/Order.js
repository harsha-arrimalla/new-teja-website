const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product',
            },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            size: { type: String },
            image: { type: String, required: true },
        }
    ],
    shippingDetails: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    paymentId: {
        type: String,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'successful', 'failed'],
        default: 'pending',
    },
    orderStatus: {
        type: String,
        enum: ['processing', 'shipped', 'delivered'],
        default: 'processing',
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0.0,
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
