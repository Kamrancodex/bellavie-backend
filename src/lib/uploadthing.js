const { createUploadthing } = require("uploadthing/server");

// Create the main uploadthing instance
const f = createUploadthing();

// Define our file routes
const ourFileRouter = {
  // Gallery image uploader
  galleryUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      // You can add authentication here if needed
      console.log("UploadThing middleware - uploading gallery image");

      // Return any metadata you want to pass to onUploadComplete
      return {
        userId: req.user?._id || "anonymous",
        source: "gallery",
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      console.log("File key:", file.key);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {
        uploadedBy: metadata.userId,
        url: file.url,
        key: file.key,
        name: file.name,
        size: file.size,
      };
    }),
};

module.exports = { ourFileRouter };
