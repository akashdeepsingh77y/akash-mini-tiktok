module.exports = async function (context, req) {
  context.log('Toggle Creator function processed a request.');

  const body = req.body;

  if (!body || !body.userId) {
    context.res = {
      status: 400,
      body: { error: "Missing userId" }
    };
    return;
  }

  // Dummy logic to toggle creator status
  const isCreator = Math.random() > 0.5;

  context.res = {
    status: 200,
    body: {
      userId: body.userId,
      creatorStatus: isCreator ? "enabled" : "disabled"
    }
  };
};
