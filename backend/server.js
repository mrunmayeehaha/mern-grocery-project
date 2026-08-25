require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");

const app = express();

connectDB();

app.use(cors());

app.use(express.json());

app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Grocery API is running" });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});