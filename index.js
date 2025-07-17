const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const XLSX = require("xlsx");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: path.resolve(__dirname, ".env") });
}
dotenv.config();

const Record = require("./models/Record");
const app = express();
const PORT = process.env.PORT || 5000;

const cors = require("cors");
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err.message));

// Middleware
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

app.get("/records", async (req, res) => {
  try {
    const records = await Record.find({});
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching records" });
  }
});

// Upload route
// app.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     const filePath = req.file.path;
//     const workbook = XLSX.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
//       defval: "",
//     });

//     const transformedData = sheetData.map((row) => ({
//       Empcode: String(row["Empcode"]).trim(),
//       FirstName: String(row["First Name"]).trim(),
//       LastName: String(row["Last Name"]).trim(),
//       Dept: String(row["Dept"]).trim(),
//       Region: String(row["Region"]).trim(),
//       Branch: String(row["Branch"]).trim(),
//       Hiredate: new Date(row["Hiredate"]),
//       Salary: Number(row["Salary"]) || 0,
//     }));

//     const inserted = await Record.insertMany(transformedData);

//     fs.unlinkSync(filePath);
//     res.json({ message: "Data inserted", count: inserted.length });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Upload failed", error: error.message });
//   }
// });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const workbook = XLSX.read(buffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: "",
    });

    const transformedData = sheetData.map((row) => ({
      Empcode: String(row["Empcode"]).trim(),
      FirstName: String(row["First Name"]).trim(),
      LastName: String(row["Last Name"]).trim(),
      Dept: String(row["Dept"]).trim(),
      Region: String(row["Region"]).trim(),
      Branch: String(row["Branch"]).trim(),
      Hiredate: new Date(row["Hiredate"]),
      Salary: Number(row["Salary"]) || 0,
    }));

    const inserted = await Record.insertMany(transformedData);
    res.json({ message: "Data inserted", count: inserted.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
