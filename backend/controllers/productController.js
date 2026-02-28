const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        // Sanitize keyword to prevent ReDoS / NoSQL injection
        const rawKeyword = req.query.keyword || '';
        const sanitized = rawKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const keyword = sanitized
            ? {
                name: {
                    $regex: sanitized,
                    $options: 'i',
                },
            }
            : {};

        const category = req.query.category ? { category: req.query.category } : {};

        const products = await Product.find({ ...keyword, ...category });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const { name, price, description, category, countInStock, featured, sizes } = req.body;
        let images = [];
        if (req.files) {
            images = req.files.map(file => `/${file.path}`);
        }

        const product = new Product({
            name,
            price: price || 0,
            description,
            category,
            stock: countInStock || 0,
            featured: featured || false,
            images,
            sizes: sizes ? sizes.split(',') : [],
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock, featured, sizes } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.price = price || product.price;
            product.description = description || product.description;
            product.category = category || product.category;
            product.stock = stock !== undefined ? stock : product.stock;
            product.featured = featured !== undefined ? featured : product.featured;
            if (sizes) product.sizes = sizes.split(',');

            if (req.files && req.files.length > 0) {
                product.images = req.files.map(file => `/${file.path}`);
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
