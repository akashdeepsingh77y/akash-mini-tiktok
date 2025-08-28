const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");

module.exports = async function (context, req) {
  try {
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!AZURE_STORAGE_CONNECTION_STRING) {
      throw new Error("Storage connection string not configured.");
    }

    // Create blob service client
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

    // Use container 'videos'
    const containerClient = blobServiceClient.getContainerClient("videos");

    // Generate unique blob name
    const blobName = uuidv4() + ".mp4";

    // Get SAS URL for upload
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const sasUrl = `${blockBlobClient.url}?${containerClient.generateSasUrl}`;

    context.res = {
      status: 200,
      body: { uploadUrl: blockBlobClient.url, blobName }
    };
  } catch (err) {
    context.res = {
      status: 500,
      body: { error: err.message }
    };
  }
};
