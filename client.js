const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Function to generate an RSA keypair
function generateKeypair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

  const publicKeyPath = path.join(__dirname, "public_key.pem");
  fs.writeFileSync(
    publicKeyPath,
    publicKey.export({ type: "pkcs1", format: "pem" })
  );

  const privateKeyPath = path.join(__dirname, "private_key.pem");
  fs.writeFileSync(
    privateKeyPath,
    privateKey.export({ type: "pkcs1", format: "pem" })
  );

  console.log(
    `Keypair generated and saved to ${publicKeyPath} and ${privateKeyPath}`
  );
}

// Function to submit the public key to a server
async function submitKey(url, password) {
  try {
    const publicKey = fs.readFileSync(
      path.join(__dirname, "public_key.pem"),
      "utf-8"
    );

    const response = await axios.post(`${url}/store-key`, {
      password,
      publicKey,
    });

    console.log("Server Response:", response.data);
  } catch (error) {
    console.error("Failed to submit the public key:", error.message);
  }
}

// Function to sign a message with the private key
function signMessage(message) {
  try {
    const privateKey = fs.readFileSync(
      path.join(__dirname, "private_key.pem"),
      "utf-8"
    );

    const signer = crypto.createSign("SHA256");
    signer.update(message);
    signer.end();
    const signature = signer.sign(privateKey, "hex");

    console.log("Message:", message);
    console.log("Signature:", signature);
  } catch (error) {
    console.error("Failed to sign the message:", error.message);
  }
}

// Function to verify a signed message with the server
async function verifyMessage(url, message, signature) {
  try {
    const response = await axios.post(`${url}/verify`, {
      message,
      signature,
    });

    console.log("Verification Result:", response.data);
  } catch (error) {
    console.error("Failed to verify the message:", error.message);
  }
}

// Main function to handle CLI arguments
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "generate-keypair":
      generateKeypair();
      break;

    case "submit-key":
      const url = args[args.indexOf("--url") + 1];
      const password = args[args.indexOf("--password") + 1];
      if (url && password) {
        submitKey(url, password);
      } else {
        console.error("Missing required options --url and --password");
      }
      break;

    case "sign":
      const message = args[args.indexOf("--message") + 1];
      if (message) {
        signMessage(message);
      } else {
        console.error("Missing required option --message");
      }
      break;

    case "verify":
      const verifyUrl = args[args.indexOf("--url") + 1];
      const verifyMessageText = args[args.indexOf("--message") + 1];
      const signature = args[args.indexOf("--signature") + 1];
      if (verifyUrl && verifyMessageText && signature) {
        verifyMessage(verifyUrl, verifyMessageText, signature);
      } else {
        console.error(
          "Missing required options --url, --message, and/or --signature"
        );
      }
      break;

    default:
      console.error("Unknown command");
      break;
  }
}

main();
