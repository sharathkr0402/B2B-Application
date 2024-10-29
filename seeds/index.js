const mongoose = require("mongoose");
const Product = require("../models/product");

const { allProducts } = require("./products");

// MongoDB Atlas connection string
mongoose.connect(
  "mongodb+srv://sharathkr0402:XuzLNuj3sAGa5B8R@cluster0.k7qii.mongodb.net/b2b-app?retryWrites=true&w=majority&appName=Cluster0&tls=true&tlsAllowInvalidCertificates=true"
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const seedDB = async () => {
  await Product.deleteMany({});
  Product.insertMany(allProducts);
};
seedDB();
