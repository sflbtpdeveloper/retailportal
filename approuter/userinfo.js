/* eslint-disable no-console */
const approuter = require("@sap/approuter");
const jwtDecode = require("jwt-decode");

let ar = approuter();

ar.beforeRequestHandler.use((req, res, next) => {

  console.log("The following request was made...");
  console.log("Method: " + req.method);
  console.log("Headers: " + req.headers);
  console.log("URL: " + req.url);
  next();
});

ar.beforeRequestHandler.use("/getUserInformation", (req, res) => {

  if (!req.user) {
    res.statusCode = 403;
    res.end("Missing JWT Token");
  }


  try {
    let decodedJWTToken = jwtDecode(req.user.token.accessToken);
    const email = decodedJWTToken.email || decodedJWTToken.user_email || "";
    debugger;
    // Check if scopes are present in the decoded token
    const scopes = decodedJWTToken.scope || decodedJWTToken.scopes || []; // Adjust based on your JWT structure

    // //16.01.2025
    // // Attempt to extract the user ID from common claims or custom claims
    // const userId =
    //   decodedJWTToken.sub ||            // Standard "subject" claim
    //   decodedJWTToken.user_id ||        // Common custom user ID claim
    //   decodedJWTToken.employee_id ||  // Example: employee_id
    //   decodedJWTToken.custom_id ||    // Example: custom_id
    //   decodedJWTToken.id ||             // Another possible key for user ID
    //   decodedJWTToken.userId
    //   "";                               // Default if not found
    // //16.01.2025

    console.log(JSON.stringify({
      decodedJWTToken,
      // userId,
      email,
      scopes
    }));
    res.statusCode = 200;
    res.end(JSON.stringify({
      user: decodedJWTToken,  // Include all user information
      // userId: userId,         // Include the extracted user ID
      email: email,
      scopes: scopes  // Include the user's scopes
    }));
  } catch (err) {
    console.error("Error decoding JWT Token:", err);
    res.statusCode = 500; // Internal Server Error
    res.end("Error processing request");
  }

});

ar.start();
