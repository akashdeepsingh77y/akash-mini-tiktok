const { getCosmos } = require("../shared/helpers");

module.exports = async function (context, req) {
  try {
    const id = context.bindingData.id;
    const { videos, comments, ratings } = getCosmos();

    // read the video doc
    const video = await videos.item(id, id).read().then(r => r.resource).catch(() => null);
    if (!video) { context.res = { status: 404, body: { error: "not_found" } }; return; }

    // comments (latest first)
    const c = await comments.items.query({
      query: "SELECT * FROM c WHERE c.videoId=@id ORDER BY c._ts DESC",
      parameters: [{ name: "@id", value: id }]
    }).fetchAll();

    // ratings and average
    const r = await ratings.items.query({
      query: "SELECT r.stars FROM r WHERE r.videoId=@id",
      parameters: [{ name: "@id", value: id }]
    }).fetchAll();
    const avg = r.resources.length ? (r.resources.reduce((a,b)=>a+(b.stars||0),0)/r.resources.length) : 0;

    context.res = {
      status: 200,
      body: {
        id: video.id,
        title: video.title,
        publisher: video.publisher,
        producer: video.producer,
        genre: video.genre,
        ageRating: video.ageRating,
        playbackUrl: video.publicPlaybackUrl || video.blobPath,
        comments: c.resources.map(x => ({ id: x.id, text: x.text })),
        avgRating: avg
      }
    };
  } catch (err) {
    context.log(err);
    context.res = { status: 500, body: { error: "server_error" } };
  }
};
