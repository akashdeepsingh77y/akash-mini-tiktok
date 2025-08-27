const { ensureCreator, getBlobService, buildBlobSAS } = require("../shared/helpers");
const { v4: uuidv4 } = require("uuid");

module.exports = async function (context, req) {
  const user = await ensureCreator(context, req);
  if (!user) return; // auth failed

  try {
    const { service, cred, account } = getBlobService();
    const container = process.env.STORAGE_CONTAINER || "videos";

    const blobName = uuidv4() + ".mp4";
    const sasUrl = buildBlobSAS(cred, account, container, blobName, "create,write");

    context.res = {
      status: 200,
      body: { uploadUrl: sasUrl, blobName }
    };
  } catch (err) {
    context.log(err);
    context.res = { status: 500, body: { error: "server_error" } };
  }
};
