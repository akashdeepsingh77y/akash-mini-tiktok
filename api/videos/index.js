const { getCosmos } = require("../shared/helpers");

module.exports = async function (context, req) {
  try {
    const { videos } = getCosmos();
    const { resources } = await videos.items
      .query("SELECT * FROM c ORDER BY c._ts DESC OFFSET 0 LIMIT 20")
      .fetchAll();

    context.res = {
      status: 200,
      body: resources
    };
  } catch (err) {
    context.log(err);
    context.res = { status: 500, body: { error: "server_error" } };
  }
};
