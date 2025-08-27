const { getCosmos } = require("../shared/helpers");
const { v4: uuidv4 } = require("uuid");

module.exports = async function (context, req) {
  try {
    const body = req.body || {};
    const { ratings } = getCosmos();

    if (!body.videoId || body.stars === undefined) {
      context.res = { status: 400, body: { error: "Missing videoId or stars" } };
      return;
    }

    const stars = Math.max(1, Math.min(5, parseInt(body.stars)));

    const doc = {
      id: uuidv4(),
      videoId: body.videoId,
      stars,
      user: body.user || "Anonymous",
      createdAt: Math.floor(Date.now()/1000)
    };

    await ratings.items.create(doc);
    context.res = { status: 201, body: doc };
  } catch (err) {
    context.log(err);
    context.res = { status: 500, body: { error: "server_error" } };
  }
};
