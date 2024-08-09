const express = require('express');
const crypto = require('crypto');
const app = express();
const port = 3000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Middleware to parse incoming URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

let storedPasswordHash = ''; // To store the hashed password
let storedPublicKey = '';    // To store the public key

// Endpoint to set and hash the password
app.post('/set-password', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).send('Password is required');
  }

  // Hash the provided password using SHA-256
  storedPasswordHash = crypto.createHash('sha256').update(password).digest('hex');

  console.log('Password has been set and hashed.');
  res.send('Password set successfully');
});

// Endpoint to store the public key after authentication
app.post('/store-key', (req, res) => {
  const { password, publicKey } = req.body;

  if (!password || !publicKey) {
    return res.status(400).send('Both password and public key are required');
  }

  // Hash the incoming password and compare it with the stored hash
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  if (hashedPassword !== storedPasswordHash) {
    console.log('Failed authentication attempt with incorrect password.');
    return res.status(401).send('Authentication failed');
  }

  // Store the public key if authentication passes
  storedPublicKey = publicKey;

  console.log('Public key stored successfully.');
  res.send('Public key stored successfully');
});

// Endpoint to verify a message's signature using the stored public key
app.post('/verify', (req, res) => {
  const { message, signature } = req.body;

  if (!message || !signature) {
    return res.status(400).send('Both message and signature are required');
  }

  try {
    // Initialize the verifier with SHA-256
    const verifier = crypto.createVerify('SHA256');
    verifier.update(message);
    verifier.end();

    // Verify the signature using the stored public key
    const isValid = verifier.verify(storedPublicKey, signature, 'hex');

    console.log(`Signature verification result: ${isValid}`);
    res.send({ valid: isValid });
  } catch (error) {
    console.error('Error during verification:', error.message);
    res.status(500).send('Error during verification');
  }
});

// Start the server on the specified port
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
