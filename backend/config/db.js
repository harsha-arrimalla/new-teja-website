const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const path = require('path');
const fs = require('fs');

const connectDB = async () => {
    try {
        const tmpDir = path.join(__dirname, '../../.mongo-tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }
        // Force MongoMemoryServer to use our local folder instead of restricted /var/folders/
        process.env.MONGOMS_DOWNLOAD_DIR = tmpDir;
        process.env.TMPDIR = tmpDir;

        const mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected (In-Memory Server): ${conn.connection.host}`);

        // Auto-seed data instantly so the UI isn't broken/empty
        const { importData } = require('../data/seeder');
        await importData();

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
