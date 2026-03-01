const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const users = [
    {
        name: 'Admin User',
        email: 'admin@ourgia.com',
        password: 'Admin@Ourgia2024!',
        role: 'admin',
    },
    {
        name: 'Test Customer',
        email: 'customer@test.com',
        password: 'Customer@Test1!',
        role: 'user',
    },
];

const products = [
    {
        name: 'Silk Blend Tailored Suit',
        category: 'clothing',
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1000'],
        description: 'Impeccably tailored from a luxurious silk blend, this suit offers a modern silhouette with uncompromising elegance.',
        price: 125000,
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 50,
        featured: true
    },
    {
        name: 'Cashmere Overcoat',
        category: 'clothing',
        images: ['https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?auto=format&fit=crop&q=80&w=1000'],
        description: 'A timeless staple crafted from pure Mongolian cashmere, providing breathable warmth and a striking drape.',
        price: 95000,
        sizes: ['M', 'L', 'XL'],
        stock: 30,
        featured: true
    },
    {
        name: 'Opulent Diamond Necklace',
        category: 'jewellery',
        images: ['https://images.unsplash.com/photo-1599643478524-fb66f70d00f0?auto=format&fit=crop&q=80&w=1000'],
        description: 'Exquisite 18k white gold necklace featuring a cascade of flawless brilliant-cut diamonds. A true masterpiece of high jewellery.',
        price: 850000,
        sizes: [],
        stock: 3,
        featured: true
    },
    {
        name: 'Emerald Cut Sapphire Ring',
        category: 'jewellery',
        images: ['https://images.unsplash.com/photo-1605100804763-247f6612d54e?auto=format&fit=crop&q=80&w=1000'],
        description: 'A striking 5-carat Ceylon sapphire nestled in a platinum setting, flanked by twin baguette diamonds.',
        price: 450000,
        sizes: [],
        stock: 5,
        featured: true
    },
    {
        name: 'Merino Wool Turtleneck',
        category: 'clothing',
        images: ['https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&q=80&w=1000'],
        description: 'Ultra-fine merino wool offers next-to-skin comfort in this versatile, minimal layering piece.',
        price: 35000,
        sizes: ['S', 'M', 'L'],
        stock: 100,
        featured: false
    },
    {
        name: 'Gold Orbit Bracelet',
        category: 'jewellery',
        images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1000'],
        description: '18k yellow gold sculpted into a continuous orbit design. Heavy, premium feel with a subtle matte finish.',
        price: 120000,
        sizes: [],
        stock: 15,
        featured: false
    }
];

const importData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        // Use User.create() so the pre('save') bcrypt hook runs
        for (const u of users) {
            await User.create(u);
        }
        await Product.insertMany(products);

        console.log('Seeder: Data Imported!');
    } catch (error) {
        console.error(`Seeding Error: ${error}`);
    }
};

// Only seed if database is empty (prevents wiping real data on restart)
const seedIfEmpty = async () => {
    try {
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();

        if (userCount === 0 && productCount === 0) {
            console.log('Empty database detected — seeding initial data...');
            await importData();
        } else {
            console.log(`Database already has data (${userCount} users, ${productCount} products). Skipping seed.`);
        }
    } catch (error) {
        console.error(`Seed check error: ${error}`);
    }
};

module.exports = { importData, seedIfEmpty };
