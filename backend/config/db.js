const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            console.error('MONGO_URI is not defined in environment variables');
            process.exit(1);
        }

        const conn = await mongoose.connect(mongoURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Auto-seed only if the database is empty (first run)
        const { seedIfEmpty } = require('../data/seeder');
        await seedIfEmpty();

    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
