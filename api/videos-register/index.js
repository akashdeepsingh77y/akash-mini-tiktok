const { ensureCreator, getCosmos } = require("../shared/helpers");
const { v4: uuidv4 } = require("uuid");

module.exports = async function (context, req) {
  const user = await ensureCreator(context, req);
  if (!user) return; // must be signed-in creator

  try {
    const body = req.body || {};
    const { videos } = getCosmos();

    const id = body.id || uuidv4();
    const doc = {
      id,
      title: body.title || "Untitled",
      publisher: body.publisher || "",
      producer: body.producer || "",
      genre: body.genre || "Other",
      ageRating: body.ageRating || "PG",
      blobPath: body.blobPath || "",
      thumbnailPath: body.thumbnailPath || "",
      uploaderUserId: user.userId,
      createdAt: Math.floor(Date.now()/1000)
    };

    await videos.items.create(doc);

    context.res = { status: 201, body: { id } };
  } catch (err) {
    context.log(err);
    context.res = { status: 500, body: { error: "server_error" } };
  }
};
