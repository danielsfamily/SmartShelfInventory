require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

console.log("MONGO_URI is:", process.env.MONGO_URI);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("mongodb connected")
  } catch (err) {
    console.error("mongodb connection error: ", err);
  }
};

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});