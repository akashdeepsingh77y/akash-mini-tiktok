const { getCosmos } = require("../shared/helpers");
const { v4: uuidv4 } = require("uuid");

module.exports = async function (context, req) {
  try {
    const body = req.body || {};
    const { comments } = getCosmos();

    if (!body.videoId || !body.text) {
      context.res = { status: 400, body: { error: "Missing videoId or text" } };
      return;
    }

    const doc = {
      id: uuidv4(),
      videoId: body.videoId,
      text: body.text,
      user: body.user || "Anonymous",
      createdAt: Math.floor(Date.now()/1000)
    };

    await comments.items.create(doc);

    context.res = { status: 201, body: doc };
  } catch (err) {
    context.log(err);
    context.res = { status: 500, body: { error: "server_error" } };
  }
};
