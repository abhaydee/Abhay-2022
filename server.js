const express = require('express');
const crypto = require('crypto');
const app = express();
const port = 3000;

// Middleware to handle JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let storedPasswordHash = ''; // Where we'll keep the hashed password
let storedPublicKey = '';    // Where we'll keep the public key

// Endpoint to set and hash the password
app.post('/set-password', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).send('Please provide a password.');
  }

  // Hash the password
  storedPasswordHash = crypto.createHash('sha256').update(password).digest('hex');

  console.log('Password has been set and hashed.');
  res.send('Password set successfully.');
});

// Endpoint to store the public key after checking the password
app.post('/store-key', (req, res) => {
  const { password, publicKey } = req.body;

  if (!password || !publicKey) {
    return res.status(400).send('Both password and public key are needed.');
  }

  // Check if the provided password matches the stored hash
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  if (hashedPassword !== storedPasswordHash) {
    console.log('Authentication failed - incorrect password.');
    return res.status(401).send('Invalid password.');
  }

  // Save the public key if the password is correct
  storedPublicKey = publicKey;

  console.log('Public key successfully stored.');
  res.send('Public key stored successfully.');
});

// Endpoint to verify a message's signature
app.post('/verify', (req, res) => {
  const { message, signature } = req.body;

  if (!message || !signature) {
    return res.status(400).send('Message and signature are required.');
  }

  try {
    // Verify the message's signature
    const verifier = crypto.createVerify('SHA256');
    verifier.update(message);
    verifier.end();

    const isValid = verifier.verify(storedPublicKey, signature, 'hex');

    console.log(`Signature verification result: ${isValid}`);
    res.send({ valid: isValid });
  } catch (error) {
    console.error('Verification error:', error.message);
    res.status(500).send('Error during verification.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
