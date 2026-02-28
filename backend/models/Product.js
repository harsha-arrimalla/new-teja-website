const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['clothing', 'jewellery'],
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    description: {
        type: String,
        required: true,
    },
    images: [{
        type: String, // URLs to the image locations
        required: true,
    }],
    sizes: [{
        type: String, // e.g. S, M, L, XL, or None for jewellery
    }],
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    featured: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
