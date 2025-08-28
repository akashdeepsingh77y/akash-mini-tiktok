// Azure Function: videos-upload-url
// Returns a SAS URL so frontend can upload video directly to Blob Storage

const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = async function (context, req) {
  try {
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!AZURE_STORAGE_CONNECTION_STRING) {
      context.res = {
        status: 500,
        body: { error: "Storage connection not configured." }
      };
      return;
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    const containerName = "videos"; // your container name
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const { filename, contentType } = req.body;
    const blobName = Date.now() + "-" + (filename || "video.mp4");

    // Get SAS URL valid for 5 minutes
    const ONE_MINUTE = 60 * 1000;
    const expiry = new Date(new Date().valueOf() + 5 * ONE_MINUTE);

    const blobClient = containerClient.getBlockBlobClient(blobName);
    const sasUrl = await blobClient.generateSasUrl({
      permissions: "cw", // create, write
      expiresOn: expiry,
      contentType: contentType || "video/mp4"
    });

    context.res = {
      status: 200,
      body: {
        uploadUrl: sasUrl,
        blobUrl: blobClient.url
      }
    };
  } catch (err) {
    context.log.error("Error generating SAS URL:", err.message);
    context.res = {
      status: 500,
      body: { error: "Failed to generate upload URL." }
    };
  }
};
