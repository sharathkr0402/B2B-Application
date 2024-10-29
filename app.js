const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const bodyParser = require("body-parser");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcryptjs");
const multer = require("multer");
//
//
//
//
//
//
// Importing models
const Admin = require("./models/Admin");
const bCustomer = require("./models/bCustomer");
const bDistributor = require("./models/bDistributor");
const bReseller = require("./models/bReseller");
const bVender = require("./models/bVender");
const bWholeseller = require("./models/bWholeseller");
const Product = require("./models/product");
const sDistributor = require("./models/sDistributor");
const sManufacture = require("./models/sManufacture");
const sVender = require("./models/sVender");
const sWholeseller = require("./models/sWholeseller");
const Cart = require("./models/cart");
//
//
//
app.use(bodyParser.json());
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/images", express.static("images"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/views", express.static(path.join(__dirname, "views")));
app.use(
  session({
    secret: "This is my secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.role = req.session.role;
  res.locals.userId = req.session.userId;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});
function ensureAuthenticated(req, res, next) {
  if (req.session.userId && req.session.role) {
    return next();
  }
  req.flash("error_msg", "Please log in to view that resource");
  res.redirect("/login");
}
//
//
//
// Middleware to check user roles
function isAdmin(req, res, next) {
  if (req.session.role === "admin") {
    return next();
  } else {
    res.status(403).send("Access denied. Admins only.");
  }
}
function isbCustomer(req, res, next) {
  if (req.session.role === "bcustomer") {
    return next();
  } else {
    res.status(403).send("Access denied. Customers only.");
  }
}

function isbDistributor(req, res, next) {
  if (req.session.role === "bdistributor") {
    return next();
  } else {
    res.status(403).send("Access denied. Distributors only.");
  }
}

function isbReseller(req, res, next) {
  if (req.session.role === "breseller") {
    return next();
  } else {
    res.status(403).send("Access denied. Resellers only.");
  }
}

function isbVender(req, res, next) {
  if (req.session.role === "bvender") {
    return next();
  } else {
    res.status(403).send("Access denied. Venders only.");
  }
}

function isbWholeseller(req, res, next) {
  if (req.session.role === "bwholeseller") {
    return next();
  } else {
    res.status(403).send("Access denied. Wholesellers only.");
  }
}
function issDistributor(req, res, next) {
  if (req.session.role === "sdistributor") {
    return next();
  } else {
    res.status(403).send("Access denied. Distributors only.");
  }
}
function issManufacture(req, res, next) {
  if (req.session.role === "smanufacture") {
    return next();
  } else {
    res.status(403).send("Access denied. Manufactures only.");
  }
}
function issVender(req, res, next) {
  if (req.session.role === "svender") {
    return next();
  } else {
    res.status(403).send("Access denied. Venders only.");
  }
}
function issWholeseller(req, res, next) {
  if (req.session.role === "swholeseller") {
    return next();
  } else {
    res.status(403).send("Access denied. Wholesellers only.");
  }
}

//
//
//
// Replace with your MongoDB Atlas connection string
mongoose.connect(
  "mongodb+srv://sharathkr0402:XuzLNuj3sAGa5B8R@cluster0.k7qii.mongodb.net/b2b-app?retryWrites=true&w=majority&appName=Cluster0&tls=true&tlsAllowInvalidCertificates=true"
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// Session setup with MongoDB store
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://sharathkr0402:XuzLNuj3sAGa5B8R@cluster0.k7qii.mongodb.net/b2b-app?retryWrites=true&w=majority&appName=Cluster0&tls=true&tlsAllowInvalidCertificates=true",
    }),
  })
);

//
//
//
//
//
//
const authRoutes = require("./routes/auth");
app.use("/", authRoutes);
//
//
//
app.get("/home", async (req, res) => {
  res.render("home");
});
//
//
//
//
//
//
//
//Products
app.get("/shopping", ensureAuthenticated, async (req, res) => {
  const products = await Product.find({});
  res.render("../views/products/products", { products });
});
//
//
//
//Product Details
app.get("/productdetails/:id", ensureAuthenticated, async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  res.render("../views/products/productdetails", { product });
});
//
//
//
//Add New Product
app.get("/addnewproduct", ensureAuthenticated, async (req, res) => {
  res.render("../views/products/addnewproduct");
});
// Set up storage engine
app.use("/uploads", express.static("uploads"));
const storageimg = multer.diskStorage({
  destination: "./uploads/", // Define the folder where the files will be stored
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Initialize upload variable
const uploadimg = multer({
  storage: storageimg,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}
app.post(
  "/addnewproduct",
  ensureAuthenticated,
  uploadimg.single("image"),
  async (req, res) => {
    try {
      const { name, price, per, qty, description } = req.body;
      const seller = req.session.user.name;
      const sellerId = req.session.user._id;

      // Ensure the file is uploaded
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const newProduct = new Product({
        name,
        image: `/uploads/${req.file.filename}`, // Access the uploaded file's filename
        price,
        per,
        qty,
        description,
        seller,
        sellerId,
      });

      // Save the product to the database
      await newProduct.save();
      req.flash("success_msg", "New Product Added Successfully.");
      res.redirect("/selling");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
//
//
//
//
//Delete the products
app.get("/deleteproduct/:id", ensureAuthenticated, async (req, res) => {
  const productId = req.params.id;
  await Product.findByIdAndDelete(productId);
  req.flash("success_msg", "Product Deleted Successfully.");
  res.redirect("/selling");
});
//
//
//
//
//
//
//Edit Product Details
app.get("/editproductdetails/:id", ensureAuthenticated, async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  req.flash("success_msg", "You can edit the Product Details.");
  res.render("../views/products/editproductdetails", { product });
});
//Update Product Details
app.post(
  "/editproduct/:id",
  ensureAuthenticated,
  uploadimg.single("image"),
  async (req, res) => {
    const productId = req.params.id;
    const updatedData = {
      name: req.body.name,
      price: req.body.price,
      per: req.body.per,
      description: req.body.description,
    };
    if (req.file) {
      // If a new image is uploaded, use it
      updatedData.image = `/uploads/${req.file.filename}`;
    } else {
      // If no new image is uploaded, retain the old one
      updatedData.image = req.body.currentImage;
    }

    await Product.findByIdAndUpdate(
      productId,
      updatedData,
      { new: true, runValidators: true } // `new: true` returns the updated document
    );
    req.flash("success_msg", "Product Details Updated.");
    res.redirect("/selling");
  }
);
//
//
//
//
//
//
//Seller's Products
app.get("/selling", ensureAuthenticated, async (req, res) => {
  const userId = req.session.user._id;
  const sellerproducts = await Product.find({ sellerId: userId });
  res.render("../views/products/sellerproducts", { sellerproducts });
});
//
//
//
//
//Add To Cart
app.post("/addtocart/:id", ensureAuthenticated, async (req, res) => {
  const productId = req.params.id;
  const buyerId = req.session.user._id;
  const { name, image, price, per, qty, seller, sellerId } =
    await Product.findById(productId);
  await Cart.insertMany({
    buyerId,
    productId,
    name,
    image,
    price,
    per,
    qty,
    rqty: req.body.rqty,
    seller,
    sellerId,
  });
  req.flash("success_msg", "Product added to your cart.");
  res.redirect("/shopping");
});
//
//
//
//Go to Cart
app.get("/gotocart", ensureAuthenticated, async (req, res) => {
  const buyerId = req.session.user._id;
  const cartProducts = await Cart.find({ buyerId });
  res.render("../views/cart/cart", { cartProducts });
});
//
//
//
//
// Route to update required quantity (rqty) in the cart
app.post("/editreqqty/:id", ensureAuthenticated, async (req, res) => {
  try {
    const cartId = req.params.id;
    const { rqty } = req.body;

    // Update the rqty in the Cart collection
    await Cart.findByIdAndUpdate(cartId, { rqty });

    res
      .status(200)
      .json({ message: "Product Required Quantity Updated Successfully." });
  } catch (error) {
    console.error("Error updating quantity:", error);
    res
      .status(500)
      .json({ message: "Failed to update quantity. Please try again." });
  }
});
//
//
//
//
//Delete Cart Product
app.post("/deletecartproduct/:id", ensureAuthenticated, async (req, res) => {
  try {
    const cartId = req.params.id;

    // Remove the product from the Cart collection
    await Cart.findByIdAndDelete(cartId);

    res
      .status(200)
      .json({ message: "Product removed from cart successfully." });
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).json({
      message: "Failed to remove product from cart. Please try again.",
    });
  }
});
//
//
//
//BUY NOW
app.get("/buynow", ensureAuthenticated, async (req, res) => {
  const buyerId = req.session.user._id;
  const cartProducts = await Cart.find({ buyerId });
  res.render("../views/cart/buynow", { cartProducts });
});
//
//
//
//About Contact and Term and Conditions
app.get("/about", ensureAuthenticated, (req, res) => {
  res.render("../views/about/about");
});
app.get("/contact", ensureAuthenticated, (req, res) => {
  res.render("../views/about/contact");
});
app.get("/privacy", ensureAuthenticated, (req, res) => {
  res.render("../views/about/privacy");
});
app.get("/refund", ensureAuthenticated, (req, res) => {
  res.render("../views/about/refund");
});
app.get("/terms", ensureAuthenticated, (req, res) => {
  res.render("../views/about/terms");
});
//
//
//
//Add new Products
app.get("/addproducts/:model", ensureAuthenticated, (req, res) => {
  const model = req.params.model;
  const redirect = model.toLowerCase();
  res.render("../views/products/addproducts", { model, redirect });
});
//
//
//
//Insert New Products
app.post("/insert/:model/:redirect", ensureAuthenticated, async (req, res) => {
  const model = req.params.model;
  const redirect = req.params.redirect;
  const service = {
    name: req.body.name,
    quantity: req.body.quantity,
    documents: JSON.parse(req.body.documents),
    price: req.body.price,
  };

  switch (model) {
    case "Accounting":
      await Accounting.insertMany(service);
      break;
  }
  res.redirect(`/${redirect}`);
});
//
//
//
//Delete the Service
app.post("/delete/:id/:redirect", ensureAuthenticated, async (req, res) => {
  const id = req.params.id;
  const redirect = req.params.redirect;

  await Product.findByIdAndDelete(id, { new: true });

  res.redirect(`/${redirect}`);
});
//
//
//
//Add images to Carousel
app.use("/uploads", express.static("uploads"));
// Image storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Define the image schema and model
const imageSchema = new mongoose.Schema({
  filename: String,
});
const Image = mongoose.model("Image", imageSchema);

// Admin-specific route
app.get("/dashboardadmin", ensureAuthenticated, isAdmin, async (req, res) => {
  const images = await Image.find();
  res.render("../views/dashboard/admin", { user: req.session.user, images });
});
// bCustomer-specific route
app.get(
  "/dashboardbcustomer",
  ensureAuthenticated,
  isbCustomer,
  async (req, res) => {
    const images = await Image.find();
    res.render("../views/dashboard/bCustomer", {
      user: req.session.user,
      images,
    });
  }
);
// bDistributor-specific route
app.get(
  "/dashboardbdistributor",
  ensureAuthenticated,
  isbDistributor,
  async (req, res) => {
    const images = await Image.find();
    res.render("../views/dashboard/bDistributor", {
      user: req.session.user,
      images,
    });
  }
);
// bReseller-specific route
app.get(
  "/dashboardbreseller",
  ensureAuthenticated,
  isbReseller,
  async (req, res) => {
    const images = await Image.find();
    res.render("../views/dashboard/bReseller", {
      user: req.session.user,
      images,
    });
  }
);

// bVender-specific route
app.get(
  "/dashboardbvender",
  ensureAuthenticated,
  isbVender,
  async (req, res) => {
    const images = await Image.find();
    res.render("../views/dashboard/bVender", {
      user: req.session.user,
      images,
    });
  }
);
//
//
//
// bWholeseller-specific route
app.get(
  "/dashboardbwholeseller",
  ensureAuthenticated,
  isbWholeseller,
  async (req, res) => {
    const images = await Image.find();
    res.render("../views/dashboard/bWholeseller", {
      user: req.session.user,
      images,
    });
  }
);
//
//
//
//
// sDistributor-specific route
app.get(
  "/dashboardsdistributor",
  ensureAuthenticated,
  issDistributor,
  async (req, res) => {
    const images = await Image.find();
    res.render("../views/dashboard/sDistributor", {
      user: req.session.user,
      images,
    });
  }
);
//
//
//
// sManufacture-specific route
app.get(
  "/dashboardsmanufacture",
  ensureAuthenticated,
  issManufacture,
  async (req, res) => {
    const images = await Image.find();
    res.render("../views/dashboard/sManufacture", {
      user: req.session.user,
      images,
    });
  }
);
//
//
//
// sVender-specific route
app.get(
  "/dashboardsvender",
  ensureAuthenticated,
  issVender,
  async (req, res) => {
    const images = await Image.find();
    res.render("../views/dashboard/sVender", {
      user: req.session.user,
      images,
    });
  }
);
//
//
//
// sWholeseller-specific route
app.get(
  "/dashboardswholeseller",
  ensureAuthenticated,
  issWholeseller,
  async (req, res) => {
    const images = await Image.find();
    res.render("../views/dashboard/sWholeseller", {
      user: req.session.user,
      images,
    });
  }
);
//
//
//
app.get("/dashboard", ensureAuthenticated, async (req, res) => {});
//
//
//
//
app.post("/upload", upload.single("image"), async (req, res) => {
  const newImage = new Image({ filename: req.file.filename });
  await newImage.save();
  res.redirect("/dashboardadmin");
});

app.post("/delete/:id", async (req, res) => {
  await Image.findByIdAndDelete(req.params.id);
  res.redirect("/dashboardadmin");
});
//
//
//
app.listen(4000, () => {
  console.log("listening on port 4000");
});
