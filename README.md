# L'AURIA - Premium Luxury E-Commerce Platform

A luxurious, high-fashion e-commerce platform built for clothing and fine jewellery. Implemented with a modern, minimal aesthetic featuring charcoal/ivory backgrounds and gold accents.

## Tech Stack
- **Frontend**: HTML5, Vanilla CSS (Variables, Grid, Flexbox), Vanilla JS.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB & Mongoose.
- **Authentication**: JWT (JSON Web Tokens) & bcrypt.
- **Payments**: Razorpay Integration (Test Mode).
- **Uploads**: Multer (Local disk storage).

## Features
### User Side
- Cinematic Home Page with responsive design.
- Shop filtering by categories (Clothing / Jewellery).
- Product Details with image gallery, out-of-stock validation, and size selectors.
- Cart state management using local storage.
- Full Checkout flow with Razorpay integration.
- Secure Auth (Register / Login).
- User Dashboard (Order History).

### Admin Side (accessible at `/admin`)
- Secure protected routes.
- Dashboard statistics (Total Revenue, Orders, Products).
- Product Management (Add, Edit, Delete, Upload Images).
- Order Management (View orders, Update shipping statuses).

## Project Setup

### 1. Requirements
- Node.js installed
- MongoDB running locally (default: `mongodb://localhost:27017/luxury_ecommerce`)

### 2. Environment Variables
A default `.env` is provided. If missing, create one in the root:
```
PORT=5001
MONGO_URI=mongodb://localhost:27017/luxury_ecommerce
JWT_SECRET=supersecret_luxury_key_2026
RAZORPAY_KEY_ID=test_key_id
RAZORPAY_KEY_SECRET=test_key_secret
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed Dummy Data
To populate the store with dummy products and an admin user:
```bash
node backend/data/seeder.js
```

**Test Admin Credentials:**
- Email: `admin@lauria.com`
- Password: `password123`

**Test Customer Credentials:**
- Email: `customer@test.com`
- Password: `password123`

### 5. Run the Server
```bash
node server.js
```

The application will be accessible at `http://localhost:5001`.

## Architecture
- `/backend`: Contains `controllers`, `models`, `routes`, `middleware`, `config`, and `data` (seeder).
- `/frontend`: Contains all static assets `css`, `js`, `images` and HTML pages.
- `/frontend/admin`: Contains the isolated SPA for the Admin portal.
- `/uploads`: Directory where product images are stored locally.
