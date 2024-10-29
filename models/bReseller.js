const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const bResellerSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: [
        "admin",
        "bcustomer",
        "bdistributor",
        "bvender",
        "breseller",
        "bwholeseller",
        "smanufacture",
        "svender",
        "swholeseller",
        "sdistributor",
      ],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String, // Path to the uploaded image
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    wallet: {
      type: Number,
      default: 0,
    },
    mobile: {
      type: Number,
    },
    bankName: {
      type: String,
    },
    accountNo: {
      type: String,
    },
    ifscCode: {
      type: String,
    },
    aadharNo: {
      type: String,
    },
    panNo: {
      type: String,
    },
    address: {
      type: String,
    },
    idNo: {
      type: String,
    },
    date: {
      type: Date,
    },
    expire: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Password hashing middleware
bResellerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
bResellerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("bReseller", bResellerSchema);
