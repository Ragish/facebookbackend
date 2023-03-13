const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const router = express.Router();
const path = require("path");
const cors = require("cors");
const baseUrl = process.env.REACT_APP_API_BASE_URL;
const PORT = process.env.PORT || 3001;

dotenv.config();

mongoose.set("strictQuery", false);

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);

// Serve static files from the public directory
app.use(express.static("public"));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", function () {
  console.log("MongoDB connected!");
});

// Check the connection status
if (db.readyState !== 1) {
  console.log("MongoDB not connected");
}

app.use(
  `&{baseUrl}/images`,
  express.static(path.join(__dirname, "public/images"))
);

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// Add the cors middleware to allow cross-origin requests from specific domains
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    console.error(error);
  }
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);

// app.listen(3001, () => {
//   console.log("Backend server is running!");
// });

app.listen(PORT, () => {
  console.log(`Server start at port no ${PORT}`);
});
