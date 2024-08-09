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

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "generate-keypair") {
    generateKeypair();
  } else {
    console.error("Unknown command");
  }
}

main();
