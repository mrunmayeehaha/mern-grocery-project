const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    category: {
        type: String,
        required: true,
        trim: true
    },

    image: {
        type: String
    },

    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    }
});

module.exports = mongoose.model("Product", productSchema);