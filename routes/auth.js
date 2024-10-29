////////////////////////////////////////////////////////////////////////////////////////////////

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
const session = require("express-session");
const path1 = require("path");
//
//
//
// Importing models
const Admin = require("../models/Admin");
const bCustomer = require("../models/bCustomer");
const bDistributor = require("../models/bDistributor");
const bReseller = require("../models/bReseller");
const bVender = require("../models/bVender");
const bWholeseller = require("../models/bWholeseller");
const Product = require("../models/product");
const sDistributor = require("../models/sDistributor");
const sManufacture = require("../models/sManufacture");
const sVender = require("../models/sVender");
const sWholeseller = require("../models/sWholeseller");
//
//
//
// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1616161616.jpg
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail", // e.g., Gmail, you can use other services
  auth: {
    user: "sharathkr0402@gmail.com",
    pass: "uzhq jkum xyqd fnlh",
  },
});

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.session.user && req.session.role) {
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
// Registration Route - GET
router.get("/register", (req, res) => {
  res.render("../views/authentication/register", { errors: [] });
});

// Registration Route - POST
router.post("/register", upload.single("image"), async (req, res) => {
  const {
    name,
    email,
    mobile,
    address,
    password,
    password2,
    buyer,
    seller,
    bankName,
    accountNo,
    ifscCode,
    aadharNo,
    panNo,
  } = req.body;
  let errors = [];

  const idNo = "BGB" + mobile;
  // Set regDate as current date
  const date = new Date();

  // Set expireDate to 3 years from the current date
  const expire = new Date();
  expire.setFullYear(date.getFullYear() + 3);

  // Basic validation
  if (
    !name ||
    !email ||
    !address ||
    !password ||
    !password2 ||
    (!seller && !buyer) ||
    !mobile ||
    !bankName ||
    !accountNo ||
    !ifscCode ||
    !aadharNo ||
    !panNo
  ) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 8) {
    errors.push({ msg: "Password must be at least 8 characters" });
  }

  if (!req.file) {
    errors.push({ msg: "Please upload an image" });
  }

  if (errors.length > 0) {
    res.render("../views/authentication/register", {
      errors,
      name,
      email,
      address,
      mobile,
      password,
      password2,
      buyer,
      seller,
      bankName,
      accountNo,
      ifscCode,
      aadharNo,
      panNo,
    });
  } else {
    let user;
    // Check if user exists
    if (seller) {
      var role = seller;
    } else {
      var role = buyer;
    }
    switch (role) {
      case "admin":
        user = await Admin.findOne({ email: email });
        break;
      case "bcustomer":
        user = await bCustomer.findOne({ email: email });
        break;
      case "bdistributor":
        user = await bDistributor.findOne({ email: email });
        break;
      case "breseller":
        user = await bReseller.findOne({ email: email });
        break;
      case "bvender":
        user = await bVender.findOne({ email: email });
        break;
      case "bwholeseller":
        user = await bWholeseller.findOne({ email: email });
        break;
      case "smanufacture":
        user = await sManufacture.findOne({ email: email });
        break;
      case "sdistributor":
        user = await sDistributor.findOne({ email: email });
        break;
      case "svender":
        user = await sVender.findOne({ email: email });
        break;
      case "swholeseller":
        user = await sWholeseller.findOne({ email: email });
        break;
    }
    if (user) {
      errors.push({ msg: "Email already exists" });
      res.render("../views/authentication/register", {
        errors,
        name,
        email,
        address,
        mobile,
        password,
        password2,
        buyer,
        seller,
        bankName,
        accountNo,
        ifscCode,
        aadharNo,
        panNo,
      });
    } else {
      try {
        let newUser;
        if (seller) {
          var role = seller;
        } else {
          var role = buyer;
        }
        switch (role) {
          case "admin":
            newUser = new Admin({
              name,
              email,
              address,
              idNo,
              mobile,
              password,
              role: seller,
              image: req.file.filename,
              bankName,
              accountNo,
              ifscCode,
              aadharNo,
              panNo,
              date,
              expire,
            });
            break;
          case "bcustomer":
            newUser = new bCustomer({
              name,
              email,
              address,
              idNo,
              mobile,
              password,
              role: buyer,
              image: req.file.filename,
              bankName,
              accountNo,
              ifscCode,
              aadharNo,
              panNo,
              date,
              expire,
            });
            break;
          case "breseller":
            newUser = new bReseller({
              name,
              email,
              address,
              idNo,
              mobile,
              password,
              role: buyer,
              image: req.file.filename,
              bankName,
              accountNo,
              ifscCode,
              aadharNo,
              panNo,
              date,
              expire,
            });
            break;
          case "bvender":
            newUser = new bVender({
              name,
              email,
              address,
              idNo,
              mobile,
              password,
              role: buyer,
              image: req.file.filename,
              bankName,
              accountNo,
              ifscCode,
              aadharNo,
              panNo,
              date,
              expire,
            });
            break;
          case "bwholeseller":
            newUser = new bWholeseller({
              name,
              email,
              address,
              idNo,
              mobile,
              password,
              role: buyer,
              image: req.file.filename,
              bankName,
              accountNo,
              ifscCode,
              aadharNo,
              panNo,
              date,
              expire,
            });
            break;
          case "bdistributor":
            newUser = new bDistributor({
              name,
              email,
              address,
              idNo,
              mobile,
              password,
              role: buyer,
              image: req.file.filename,
              bankName,
              accountNo,
              ifscCode,
              aadharNo,
              panNo,
              date,
              expire,
            });
            break;
          case "sdistributor":
            newUser = new sDistributor({
              name,
              email,
              address,
              idNo,
              mobile,
              password,
              role: seller,
              image: req.file.filename,
              bankName,
              accountNo,
              ifscCode,
              aadharNo,
              panNo,
              date,
              expire,
            });
            break;
          case "smanufacture":
            newUser = new sManufacture({
              name,
              email,
              address,
              idNo,
              mobile,
              password,
              role: seller,
              image: req.file.filename,
              bankName,
              accountNo,
              ifscCode,
              aadharNo,
              panNo,
              date,
              expire,
            });
            break;
          case "svender":
            newUser = new sVender({
              name,
              email,
              address,
              idNo,
              mobile,
              password,
              role: seller,
              image: req.file.filename,
              bankName,
              accountNo,
              ifscCode,
              aadharNo,
              panNo,
              date,
              expire,
            });
            break;
          case "swholeseller":
            newUser = new sWholeseller({
              name,
              email,
              address,
              idNo,
              mobile,
              password,
              role: seller,
              image: req.file.filename,
              bankName,
              accountNo,
              ifscCode,
              aadharNo,
              panNo,
              date,
              expire,
            });
            break;
          default:
            return res.status(400).send("Invalid role selected.");
        }

        await newUser.save();
        req.flash("success_msg", "You Sucessfully Registered, Please Login.");
        res.redirect("/login");
      } catch (error) {
        console.log(error);
        res.status(500).send("Error registering new user.");
      }
    }
  }
});

// Login Route - GET
router.get("/login", (req, res) => {
  res.render("../views/authentication/login", { errors: [] });
});

// Login Route - POST
router.post("/login", async (req, res) => {
  const { email, password, buyer, seller } = req.body;
  let errors = [];

  if (!email || !password || (!seller && !buyer)) {
    errors.push({ msg: "Please enter all fields" });
    return res.render("../views/authentication/login", {
      errors,
      email,
      password,
      buyer,
      seller,
    });
  }

  try {
    let user;
    if (seller) {
      var role = seller;
    } else {
      var role = buyer;
    }
    switch (role) {
      case "admin":
        user = await Admin.findOne({ email });
        if (!user) {
          errors.push({ msg: "That email is not registered" });
          return res.render("../views/authentication/login", {
            errors,
            role: seller,
            email,
            password,
          });
        }
        break;
      case "bcustomer":
        user = await bCustomer.findOne({ email });
        if (!user) {
          errors.push({ msg: "That email is not registered" });
          return res.render("../views/authentication/login", {
            errors,
            role: buyer,
            email,
            password,
          });
        }
        break;
      case "bdistributor":
        user = await bDistributor.findOne({ email });
        if (!user) {
          errors.push({ msg: "That email is not registered" });
          return res.render("../views/authentication/login", {
            errors,
            role: buyer,
            email,
            password,
          });
        }
        break;
      case "breseller":
        user = await bReseller.findOne({ email });
        if (!user) {
          errors.push({ msg: "That email is not registered" });
          return res.render("../views/authentication/login", {
            errors,
            role: buyer,
            email,
            password,
          });
        }
        break;
      case "bvender":
        user = await bVender.findOne({ email });
        if (!user) {
          errors.push({ msg: "That email is not registered" });
          return res.render("../views/authentication/login", {
            errors,
            role: buyer,
            email,
            password,
          });
        }
        break;
      case "bwholeseller":
        user = await bWholeseller.findOne({ email });
        if (!user) {
          errors.push({ msg: "That email is not registered" });
          return res.render("../views/authentication/login", {
            errors,
            role: buyer,
            email,
            password,
          });
        }
        break;
      case "sdistributor":
        user = await sDistributor.findOne({ email });
        if (!user) {
          errors.push({ msg: "That email is not registered" });
          return res.render("../views/authentication/login", {
            errors,
            role: seller,
            email,
            password,
          });
        }
        break;
      case "smanufacture":
        user = await sManufacture.findOne({ email });
        if (!user) {
          errors.push({ msg: "That email is not registered" });
          return res.render("../views/authentication/login", {
            errors,
            role: seller,
            email,
            password,
          });
        }
        break;
      case "svender":
        user = await sVender.findOne({ email });
        if (!user) {
          errors.push({ msg: "That email is not registered" });
          return res.render("../views/authentication/login", {
            errors,
            role: seller,
            email,
            password,
          });
        }
        break;
      case "swholeseller":
        user = await sWholeseller.findOne({ email });
        if (!user) {
          errors.push({ msg: "That email is not registered" });
          return res.render("../views/authentication/login", {
            errors,
            role: seller,
            email,
            password,
          });
        }
        break;
      default:
        return res.status(400).send("Invalid role selected.");
    }

    if (user && (await user.comparePassword(password))) {
      req.session.userId = user._id;
      req.session.role = user.role;
    } else {
      errors.push({ msg: "Incorrect password" });
      return res.render("../views/authentication/login", {
        errors,
        role,
        email,
        password,
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();

    // Send OTP via email
    const mailOptions = {
      from: "sharathkr0402@gmail.com",
      to: user.email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Nodemailer Error:", error);
        req.flash("error_msg", "Error sending OTP. Please try again.");
        return res.redirect("/login");
      } else {
        console.log("Email sent: " + info.response);
        // Store user ID in session for OTP verification
        req.session.tempUser = { id: user._id };
        res.redirect("/otp");
      }
    });
  } catch (err) {
    console.log(err);
    res.redirect("/login");
  }
});

// OTP Verification Route - GET
router.get("/otp", (req, res) => {
  if (!req.session.tempUser) {
    req.flash("error_msg", "Please log in first");
    return res.redirect("/login");
  }
  res.render("../views/authentication/otp", { errors: [] });
});

// OTP Verification Route - POST
router.post("/otp", async (req, res) => {
  const { otp } = req.body;
  let errors = [];

  if (!otp) {
    errors.push({ msg: "Please enter the OTP" });
    return res.render("../views/authentication/otp", { errors });
  }

  if (!req.session.tempUser) {
    req.flash("error_msg", "Session expired. Please log in again.");
    return res.redirect("/login");
  }

  try {
    let user;
    let role = req.session.role;

    switch (role) {
      case "admin":
        user = await Admin.findById(req.session.tempUser.id);
        break;
      case "bcustomer":
        user = await bCustomer.findById(req.session.tempUser.id);
        break;
      case "bdistributor":
        user = await bDistributor.findById(req.session.tempUser.id);
        break;
      case "breseller":
        user = await bReseller.findById(req.session.tempUser.id);
        break;
      case "bvender":
        user = await bVender.findById(req.session.tempUser.id);
        break;
      case "bwholeseller":
        user = await bWholeseller.findById(req.session.tempUser.id);
        break;
      case "sdistributor":
        user = await sDistributor.findById(req.session.tempUser.id);
        break;
      case "smanufacture":
        user = await sManufacture.findById(req.session.tempUser.id);
        break;
      case "svender":
        user = await sVender.findById(req.session.tempUser.id);
        break;
      case "swholeseller":
        user = await sWholeseller.findById(req.session.tempUser.id);
        break;
      default:
        return res.status(400).send("Invalid role selected.");
    }
    if (!user) {
      errors.push({ msg: "User not found" });
      return res.render("../views/authentication/otp", { errors });
    }

    if (user.otp !== otp) {
      errors.push({ msg: "Incorrect OTP" });
      return res.render("../views/authentication/otp", { errors });
    }

    if (user.otpExpires < Date.now()) {
      errors.push({ msg: "OTP has expired" });
      return res.render("../views/authentication/otp", { errors });
    }

    // OTP is valid
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    req.session.user = user;
    delete req.session.tempUser;

    res.redirect("/dashboard" + user.role);
  } catch (err) {
    console.log(err);
    res.redirect("/login");
  }
});
//
//
//
///////////////////////////  Profile Details  ///////////////////
router.get("/profileDetails", ensureAuthenticated, (req, res) => {
  res.render("../views/details/profiledetails");
});
router.get("/bank", ensureAuthenticated, (req, res) => {
  res.render("../views/details/bank");
});
router.get("/kyc", ensureAuthenticated, (req, res) => {
  res.render("../views/details/kyc");
});
/* router.get("/letterHead", ensureAuthenticated, (req, res) => {
  res.render("../views/details/letterhead");
});
router.get("/certificate", ensureAuthenticated, (req, res) => {
  res.render("../views/details/certification");
});
router.get("/businessCard", ensureAuthenticated, (req, res) => {
  res.render("../views/details/businesscard");
});
router.get("/idCard", ensureAuthenticated, (req, res) => {
  res.render("../views/details/idcard");
});
router.get("/myBizCard", ensureAuthenticated, (req, res) => {
  res.render("../views/details/mybizcards");
}); */
//
//
//
//
/////////////////////  Profile and Bank Details Edit  ////////////////
router.get("/profileedit", ensureAuthenticated, (req, res) => {
  res.render("../views/details/profileedit");
});
router.post("/profileedit/:id", ensureAuthenticated, (req, res) => {
  res.render("../views/details/profileedit");
});
router.get("/bankedit", ensureAuthenticated, (req, res) => {
  res.render("../views/details/bankedit");
});
//
//
//
//
//
//
///////////////////// All Admin's ////////////////////////////////////
//All bCustomer
router.get("/allbCustomers", ensureAuthenticated, async (req, res) => {
  const allbCustomers = await bCustomer.find({});
  res.render("../views/manageuser/allbCustomers", { allbCustomers });
});
//All bDistributors
router.get("/allbDistributors", ensureAuthenticated, async (req, res) => {
  const allbDistributors = await bDistributor.find({});
  res.render("../views/manageuser/allbDistributors", { allbDistributors });
});
//All bResellers
router.get("/allbResellers", ensureAuthenticated, async (req, res) => {
  const allbResellers = await bReseller.find({});
  res.render("../views/manageuser/allbResellers", { allbResellers });
});
//All bVenders
router.get("/allbVenders", ensureAuthenticated, async (req, res) => {
  const allbVenders = await bVender.find({});
  res.render("../views/manageuser/allbVenders", { allbVenders });
});
//All bWholesellers
router.get("/allbWholesellers", ensureAuthenticated, async (req, res) => {
  const allbWholesellers = await bWholeseller.find({});
  res.render("../views/manageuser/allbWholesellers", { allbWholesellers });
});
//All sDistributors
router.get("/allsDistributors", ensureAuthenticated, async (req, res) => {
  const allsDistributors = await sDistributor.find({});
  res.render("../views/manageuser/allsDistributors", { allsDistributors });
});
//All sManufactures
router.get("/allsManufactures", ensureAuthenticated, async (req, res) => {
  const allsManufactures = await sManufacture.find({});
  res.render("../views/manageuser/allsManufactures", { allsManufactures });
});
//All sVenders
router.get("/allsVenders", ensureAuthenticated, async (req, res) => {
  const allsVenders = await sVender.find({});
  res.render("../views/manageuser/allsVenders", { allsVenders });
});
//All sWholesellers
router.get("/allsWholesellers", ensureAuthenticated, async (req, res) => {
  const allsWholesellers = await sWholeseller.find({});
  res.render("../views/manageuser/allsWholesellers", { allsWholesellers });
});
//
//
//
//
//
//
//
//
// Logout Route
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.redirect("/dashboard" + req.session.user.role);
    } else {
      res.clearCookie("connect.sid");
      res.redirect("/login");
    }
  });
});

module.exports = router;
