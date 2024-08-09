const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Function to generate an RSA key pair
function generateKeypair() {
  try {
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
      `RSA key pair generated and saved to ${publicKeyPath} and ${privateKeyPath}`
    );
  } catch (error) {
    console.error("Error generating key pair:", error.message);
  }
}

// Function to submit the public key to a server
async function submitKey(url, password) {
  try {
    if (!url || !password)
      throw new Error("Both URL and password must be provided.");

    const publicKey = fs.readFileSync(
      path.join(__dirname, "public_key.pem"),
      "utf-8"
    );

    const response = await axios.post(`${url}/store-key`, {
      password,
      publicKey,
    });

    console.log("Public key submitted:", response.data);
  } catch (error) {
    console.error("Error submitting public key:", error.message);
  }
}

// Function to sign a message using the private key
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
    console.log(`Message signed. Signature: ${signature}`);
  } catch (error) {
    console.error("Error signing message:", error.message);
  }
}

// Function to verify a signed message with the server
async function verifyMessage(url, message, signature) {
  try {
    if (!url || !message || !signature)
      throw new Error("URL, message, and signature are required.");

    // Debugging information
    console.log('Verifying message with the following details:');
    console.log(`URL: ${url}`);
    console.log(`Message: ${message}`);
    console.log(`Signature: ${signature}`);

    const response = await axios.post(`${url}/verify`, { message, signature });

    console.log("Signature verification result:", response.data);
  } catch (error) {
    console.error("Error verifying message:", error.message);
  }
}

// Main function to process CLI arguments
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Map arguments to their respective values
  const argMap = {};
  for (let i = 1; i < args.length; i += 2) {
    argMap[args[i]] = args[i + 1];
  }

  // Debugging information
  console.log('Command:', command);
  console.log('Arguments:', argMap);

  switch (command) {
    case "generate-keypair":
      generateKeypair();
      break;

    case "submit-key":
      const submitUrl = argMap["--url"];
      const submitPassword = argMap["--password"];
      if (!submitUrl || !submitPassword) {
        console.error("URL and password are required for submit-key.");
        break;
      }
      submitKey(submitUrl, submitPassword);
      break;

    case "sign":
      const signMessageText = argMap["--message"];
      if (!signMessageText) {
        console.error("Message is required for sign.");
        break;
      }
      signMessage(signMessageText);
      break;

    case "verify":
      const verifyUrl = argMap["--url"];
      const verifyMsg = argMap["--message"];
      const signature = argMap["--signature"];
      if (!verifyUrl || !verifyMsg || !signature) {
        console.error("URL, message, and signature are required for verify.");
        break;
      }
      verifyMessage(verifyUrl, verifyMsg, signature);
      break;

    default:
      console.error(
        "Unknown command. Please use one of: generate-keypair, submit-key, sign, verify."
      );
      break;
  }
}

main();
