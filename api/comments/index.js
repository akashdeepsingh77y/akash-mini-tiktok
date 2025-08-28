module.exports = async function (context, req) {
  context.log('Comments function triggered');
  const name = (req.query.name || (req.body && req.body.name));
  context.res = {
    status: 200,
    body: { message: "Hello " + (name || "from Comments API!") }
  };
}