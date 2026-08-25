# 🛒 MERN Grocery Store

A full-stack grocery store application built using the MERN stack.

## Tech Stack

- MongoDB
- Express.js
- React.js
- Node.js
- JWT Authentication

## Features

- User Registration and Login
- JWT Authentication
- Protected Routes
- Admin Authorization
- Product CRUD
- Shopping Cart
- Checkout
- Order Management
- Stock Management
- Order Status Updates
- Product Validation

## Project Structure

```text
mern-grocery-project/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
└── README.md

How It Works
React Frontend
      ↓
Express / Node.js API
      ↓
JWT Authentication
      ↓
MongoDB Atlas
Main API Routes
Authentication
POST /api/auth/register
POST /api/auth/login
Products
GET /api/products
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
Cart
GET /api/cart
POST /api/cart
PUT /api/cart/:productId
DELETE /api/cart/:productId
Orders
POST /api/orders
GET /api/orders
PUT /api/orders/:id
Security
Passwords are hashed before storage.
JWT is used for authentication.
Protected routes require a valid JWT.
Admin-only operations use role-based authorization.
Environment variables are used for sensitive configuration.
Running Locally
Backend
cd backend
npm install
npm run dev
Frontend
cd frontend
npm install
npm run dev
Environment Variables

Create a .env file inside backend:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Do not commit .env to GitHub.


Then:

```bash
git add README.md
git commit -m "Add project documentation"
git push