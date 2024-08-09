const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

//generating keypair
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

async function verifyMessage(message, signature) {
    try {
      const publicKey = fs.readFileSync(
        path.join(__dirname, "public_key.pem"),
        "utf-8"
      );
  
      const verifier = crypto.createVerify("SHA256");
      verifier.update(message);
      verifier.end();
      const isValid = verifier.verify(publicKey, signature, "hex");
  
      console.log("Message:", message);
      console.log("Signature:", signature);
      console.log("Is the signature valid?", isValid);
    } catch (error) {
      console.error("Failed to verify the message:", error.message);
    }
  }

  function main() {
    const args = process.argv.slice(2);
    const command = args[0];
  
    if (command === "generate-keypair") {
      generateKeypair();
    } else if (command === "submit-key") {
      const url = args[args.indexOf("--url") + 1];
      const password = args[args.indexOf("--password") + 1];
      if (url && password) {
        submitKey(url, password);
      } else {
        console.error("Missing required options --url and --password");
      }
    } else if (command === "sign") {
      const message = args[args.indexOf("--message") + 1];
      if (message) {
        signMessage(message);
      } else {
        console.error("Missing required option --message");
      }
    } else if (command === "verify") {
      const message = args[args.indexOf("--message") + 1];
      const signature = args[args.indexOf("--signature") + 1];
      if (message && signature) {
        verifyMessage(message, signature);
      } else {
        console.error("Missing required options --message and --signature");
      }
    } else {
      console.error("Unknown command");
    }
  }
main();
