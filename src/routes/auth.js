require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { readDataFromFile, writeDataToFile } = require("../utils/fileHandler");

const router = express.Router();


// Load users data
const usersFile = "users.json";

// User Registration
router.post("/register", async (req, res) => {
  const users = readDataFromFile(usersFile);
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userPresent = users.find((u) => u.email === email);
  if (userPresent?.email) {
    return res.status(400).json({ message: "User Exists!.." });
  }

  const user = { email, password: hashedPassword };
  users.push(user);
  writeDataToFile(usersFile, users);
  res.status(201).json({ message: "User registered successfully", data: user });
});

// User Login
router.post("/login", async (req, res) => {
  const users = readDataFromFile(usersFile);
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '2d' } );
  res.json({ token, data: user });
});

module.exports = router;
