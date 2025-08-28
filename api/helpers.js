const { CosmosClient } = require("@azure/cosmos");
const { BlobServiceClient, StorageSharedKeyCredential,
        generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol } = require("@azure/storage-blob");

/** Connect to Cosmos DB (NoSQL) and return handles to containers */
function getCosmos() {
  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;
  const databaseId = process.env.COSMOS_DATABASE || "minitok";
  if (!endpoint || !key) throw new Error("Missing Cosmos env");
  const client = new CosmosClient({ endpoint, key });
  const db = client.database(databaseId);
  return {
    db,
    users: db.container(process.env.COSMOS_CONTAINER_USERS || "users"),
    videos: db.container(process.env.COSMOS_CONTAINER_VIDEOS || "videos"),
    comments: db.container(process.env.COSMOS_CONTAINER_COMMENTS || "comments"),
    ratings: db.container(process.env.COSMOS_CONTAINER_RATINGS || "ratings"),
  };
}

/** Read user info that Static Web Apps puts in the request headers */
function getUserFromHeader(req) {
  const header = req.headers["x-ms-client-principal"] || req.headers["X-MS-CLIENT-PRINCIPAL"];
  if (!header) return null;
  try {
    const json = JSON.parse(Buffer.from(header, "base64").toString("utf-8"));
    return {
      userId: json.userId,
      userDetails: json.userDetails,
      identityProvider: json.identityProvider,
      roles: json.userRoles || []
    };
  } catch {
    return null;
  }
}

/** Require sign-in */
function ensureAuth(ctx, req) {
  const u = getUserFromHeader(req);
  if (!u) {
    ctx.res = { status: 401, body: { error: "signin_required" } };
    return null;
  }
  return u;
}

/** Require creator role (either SWA role or DB flag) */
async function ensureCreator(ctx, req) {
  const u = ensureAuth(ctx, req);
  if (!u) return null;
  if ((u.roles||[]).includes("creator")) return u;
  try {
    const { users } = getCosmos();
    const doc = await users.item(u.userId, u.userId).read();
    if (doc.resource && doc.resource.creator) return u;
  } catch {}
  ctx.res = { status: 403, body: { error: "creator_only" } };
  return null;
}

/** Connect to Blob Storage for video upload/playback */
function getBlobService() {
  const account = process.env.STORAGE_ACCOUNT;
  const key = process.env.STORAGE_KEY;
  if (!account || !key) throw new Error("Missing storage env");
  const cred = new StorageSharedKeyCredential(account, key);
  const service = new BlobServiceClient(`https://${account}.blob.core.windows.net`, cred);
  return { service, cred, account };
}

/** Create a short-lived SAS URL so the browser can upload directly */
function buildBlobSAS(cred, account, container, blob, permissions, minutes=15) {
  const expiresOn = new Date(Date.now() + minutes * 60 * 1000);
  const sas = generateBlobSASQueryParameters({
    containerName: container,
    blobName: blob,
    expiresOn,
    permissions: BlobSASPermissions.parse(permissions),
    protocol: SASProtocol.Https
  }, cred).toString();
  const url = `https://${account}.blob.core.windows.net/${container}/${blob}?${sas}`;
  return url;
}

module.exports = { getCosmos, getUserFromHeader, ensureAuth, ensureCreator, getBlobService, buildBlobSAS };
