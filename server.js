const express = require("express");
const crypto = require("crypto");
const app = express();
const port = 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

let storedPasswordHash = ""; // Storing the hashed password
let storedPublicKey = "";

app.get("/", (req, res) => {
  res.send("Server is running");
});

// API Endpoint to set and hash the password
app.post("/set-password", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).send("Password is required");
  }

  // Hash the provided password using SHA-256
  storedPasswordHash = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  console.log("Password has been set and hashed.");
  res.send("Password set successfully");
});

// API Endpoint to store the public key after authentication
app.post("/store-key", (req, res) => {
  const { password, publicKey } = req.body;

  if (!password || !publicKey) {
    return res.status(400).send("Both password and public key are required");
  }

  // Hash the incoming password and compare it with the stored hash
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
  if (hashedPassword !== storedPasswordHash) {
    console.log("------Failed authentication attempt with incorrect password-------");
    return res.status(401).send("Authentication failed");
  }

  // Store the public key if authentication passes
  storedPublicKey = publicKey;

  console.log("Public key stored Yay!!!!");
  res.send("Public key stored Yay!!!!");
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
