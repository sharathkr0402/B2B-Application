const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const productSchema = new mongoose.Schema({
  name: { type: String },
  image: { type: String },
  price: { type: Number },
  per: { type: String },
  qty: { type: Number },
  description: { type: String },
  seller: { type: String },
  sellerId: { type: String },
});

module.exports = mongoose.model("Product", productSchema);
