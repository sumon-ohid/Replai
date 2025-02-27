// import jwt from "jsonwebtoken";
// import jwksRsa from "jwks-rsa";

// const GOOGLE_ISSUER = "https://accounts.google.com";
// const JWKS_URI = "https://www.googleapis.com/oauth2/v3/certs";

// // Set up JWKS client to fetch Google's public keys
// const client = jwksRsa({
//   jwksUri: JWKS_URI,
// });

// // Function to get the signing key
// const getKey = (header, callback) => {
//   client.getSigningKey(header.kid, (err, key) => {
//     if (err) {
//       callback(err);
//     } else {
//       callback(null, key.getPublicKey());
//     }
//   });
// };

// // Security event handler function
// export const handleSecurityEvent = (req, res) => {
//   const { security_event_token: token } = req.body;

//   if (!token) {
//     return res.status(400).json({ error: "No security event token provided" });
//   }

//   jwt.verify(token, getKey, { issuer: GOOGLE_ISSUER }, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ error: "Invalid token" });
//     }

//     console.log("Security Event Received:", decoded);

//     // Implement your security response logic here
//     // Example: Log out user, reset session, notify admins, etc.

//     // Take user to home page

//     res.redirect("/");
//     res.sendStatus(204);
//   });
// };
