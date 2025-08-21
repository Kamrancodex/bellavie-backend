const express = require("express");
const { createRouteHandler } = require("uploadthing/express");
const { ourFileRouter } = require("../lib/uploadthing");

const router = express.Router();

// Prepare UploadThing token
let utToken = process.env.UPLOADTHING_TOKEN || "";
if (!utToken) {
  const apiKey =
    process.env.UPLOADTHING_SECRET || process.env.UPLOADTHING_API_KEY || "";
  const appId =
    process.env.UPLOADTHING_APP_ID || process.env.UPLOADTHING_APPID || "";
  const regions = process.env.UPLOADTHING_REGIONS
    ? process.env.UPLOADTHING_REGIONS.split(",").map((r) => r.trim())
    : ["sea1"]; // default to sea1 as provided earlier

  if (apiKey && appId) {
    try {
      const payload = { apiKey, appId, regions };
      utToken = Buffer.from(JSON.stringify(payload)).toString("base64");
      // eslint-disable-next-line no-console
      console.log("UploadThing token generated from API key and app ID.");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Failed to generate UploadThing token:", e);
    }
  }
}

// Create the UploadThing route handler
const uploadthingHandler = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: utToken,
    callbackUrl: process.env.UPLOADTHING_CALLBACK_URL,
  },
});

// Handle both GET and POST requests for UploadThing
router.use("/", uploadthingHandler);

module.exports = router;
