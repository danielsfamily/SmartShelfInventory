require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

console.log("MONGO_URI is:", process.env.MONGO_URI);
const PUBLIC_DIR = path.join(__dirname, "public");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("mongodb connected");
  } catch (err) {
    console.error("mongodb connection error: ", err);
  }
};

const app = express();
app.use(express.static(PUBLIC_DIR));
app.use(cors());
app.use(express.json());
app.get("/hello", (req,res)=> res.send( `<h1>howdy</h1>
<p> Sublime is an American ska punk band from Long Beach, California, that plays a mix of ska, punk, and reggae. Formed in 1988,[1] the band's original lineup consisted of Bradley Nowell (vocals and guitar), Eric Wilson (bass), and Bud Gaugh (drums). Lou Dog, Nowell's dalmatian, was the mascot of the band. Nowell died of a heroin overdose in 1996, resulting in the band's breakup. In 1997, songs such as "What I Got", "Santeria", "Wrong Way", "Doin' Time", and "April 29, 1992 (Miami)" were released to U.S. radio.[2]</p>`))



const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/Product");
app.use("/api/auth", authRoutes);
app.use("/api/products",productRoutes);

connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
