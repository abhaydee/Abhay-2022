### Take Home Assignment

This project helps to get a basic understanding of the RSA Key management systems with functionalities such as key-pair generation,  key submission,  message signing and the message verification 

1. Clone the repository and install the dependencies required for the project

   Make sure you have nodejs installed. You can visit this website to install nodejs for macos, windows or linux : https://nodejs.org/en/download/package-manager

   Once you download it,  use the command "npm install" to install the dependencies

2. To start the nodejs server: use: 

   node server.js

3. Generate a RSA keypair

   node client.js generate-keypair

4. To set a password for the server, use:

   curl -X POST http://localhost:3000/set-password -H "Content-Type: application/json" -d '{"password": "yourpassword"}'

   For now, avoid using backticks or excessive slashes 
   alphanumeric charectors are supported


5. Submit the generated public key to the server:

   node client.js submit-key --url http://localhost:3000 --password yourpassword


6. To sign a message with the private key:

   node client.js sign --message "your message"

7. To verify a signed message with the public key:

   node client.js verify --url "http://localhost:3000" --message "yourmessage" --signature "yoursignature"

