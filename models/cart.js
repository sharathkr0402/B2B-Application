const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  buyerId: { type: String },
  productId: { type: String },
  name: { type: String },
  image: { type: String },
  price: { type: Number },
  per: { type: String },
  qty: { type: Number },
  rqty: { type: Number },
  seller: { type: String },
  sellerId: { type: String },
});

module.exports = mongoose.model("Cart", cartSchema);
