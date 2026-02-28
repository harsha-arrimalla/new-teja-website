const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    try {
        const { orderItems, shippingDetails, paymentId, totalAmount } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Server-side price validation — recalculate total from DB prices
        const productIds = orderItems.map(item => item.product);
        const dbProducts = await Product.find({ _id: { $in: productIds } });

        if (dbProducts.length !== productIds.length) {
            return res.status(400).json({ message: 'One or more products not found' });
        }

        const priceMap = {};
        dbProducts.forEach(p => { priceMap[p._id.toString()] = p.price; });

        let calculatedTotal = 0;
        const validatedItems = orderItems.map(item => {
            const dbPrice = priceMap[item.product];
            if (dbPrice === undefined) {
                throw new Error(`Product ${item.product} not found`);
            }
            // Check stock
            const dbProduct = dbProducts.find(p => p._id.toString() === item.product);
            if (dbProduct.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${dbProduct.name}`);
            }
            calculatedTotal += dbPrice * (item.quantity || 1);
            return {
                ...item,
                price: dbPrice, // override client-side price with DB price
            };
        });

        // Allow 1% tolerance for rounding differences
        if (Math.abs(calculatedTotal - totalAmount) > calculatedTotal * 0.01) {
            return res.status(400).json({
                message: 'Price mismatch detected. Please refresh and try again.',
            });
        }

        // Deduct stock
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -(item.quantity || 1) },
            });
        }

        const order = new Order({
            user: req.user._id,
            items: validatedItems,
            shippingDetails,
            paymentId,
            paymentStatus: paymentId ? 'successful' : 'pending',
            totalAmount: calculatedTotal, // use server-calculated total
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.orderStatus = orderStatus;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    addOrderItems,
    getOrderById,
    getMyOrders,
    getOrders,
    updateOrderStatus,
};
