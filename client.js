const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Function to generate an RSA key pair
function generateKeypair() {
  try {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });

    const publicKeyPath = path.join(__dirname, 'public_key.pem');
    fs.writeFileSync(publicKeyPath, publicKey.export({ type: 'pkcs1', format: 'pem' }));

    const privateKeyPath = path.join(__dirname, 'private_key.pem');
    fs.writeFileSync(privateKeyPath, privateKey.export({ type: 'pkcs1', format: 'pem' }));

    console.log(`RSA key pair generated and saved to ${publicKeyPath} and ${privateKeyPath}`);
  } catch (error) {
    console.error('Error generating key pair:', error.message);
  }
}

// Function to submit the public key to a server
async function submitKey(url, password) {
  try {
    if (!url || !password) throw new Error('Both URL and password must be provided.');

    const publicKey = fs.readFileSync(path.join(__dirname, 'public_key.pem'), 'utf-8');

    const response = await axios.post(`${url}/store-key`, { password, publicKey });

    console.log('Public key submitted:', response.data);
  } catch (error) {
    console.error('Error submitting public key:', error.message);
  }
}

// Function to sign a message using the private key
function signMessage(message) {
  try {
    const privateKey = fs.readFileSync(path.join(__dirname, 'private_key.pem'), 'utf-8');

    const signer = crypto.createSign('SHA256');
    signer.update(message);
    signer.end();

    const signature = signer.sign(privateKey, 'hex');
    console.log(`Message signed. Signature: ${signature}`);
  } catch (error) {
    console.error('Error signing message:', error.message);
  }
}

// Function to verify a signed message with the server
async function verifyMessage(url, message, signature) {
  try {
    if (!url || !message || !signature) throw new Error('URL, message, and signature are required.');

    const response = await axios.post(`${url}/verify`, { message, signature });

    console.log('Signature verification result:', response.data);
  } catch (error) {
    console.error('Error verifying message:', error.message);
  }
}

// Main function to process CLI arguments
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'generate-keypair':
      generateKeypair();
      break;

    case 'submit-key':
      const url = args[args.indexOf('--url') + 1];
      const password = args[args.indexOf('--password') + 1];
      submitKey(url, password);
      break;

    case 'sign':
      const message = args[args.indexOf('--message') + 1];
      signMessage(message);
      break;

    case 'verify':
      const verifyUrl = args[args.indexOf('--url') + 1];
      const verifyMessage = args[args.indexOf('--message') + 1];
      const signature = args[args.indexOf('--signature') + 1];
      verifyMessage(verifyUrl, verifyMessage, signature);
      break;

    default:
      console.error('Unknown command. Please use one of: generate-keypair, submit-key, sign, verify.');
      break;
  }
}

main();
