const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
  {
    Empcode: String,
    FirstName: String,
    LastName: String,
    Dept: String,
    Region: String,
    Branch: String,
    Hiredate: Date,
    Salary: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Record", recordSchema);
