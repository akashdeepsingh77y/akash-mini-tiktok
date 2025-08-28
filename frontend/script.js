// Mini TikTok - frontend script (student level)
// Wires the Upload button to your Azure Functions:
//   1) POST /api/videos-upload-url  -> get a SAS upload URL
//   2) PUT  to that SAS URL          -> upload the file to storage
//   3) POST /api/videos-register     -> save video metadata
//
// HTML element IDs expected (already in your page or easy to rename):
//   <input  type="file" id="videoFile">
//   <button id="uploadBtn">Upload</button>
//   <div    id="status"></div>
//   <video  id="preview" controls></video>

const els = {
  file:    document.getElementById("videoFile"),
  btn:     document.getElementById("uploadBtn"),
  status:  document.getElementById("status"),
  preview: document.getElementById("preview"),
};

function setStatus(msg) {
  if (!els.status) return;
  els.status.textContent = msg;
}

if (els.file) {
  els.file.addEventListener("change", () => {
    const f = els.file.files?.[0];
    if (f && els.preview) {
      els.preview.src = URL.createObjectURL(f);
      els.preview.load();
    }
  });
}

async function uploadVideo() {
  const file = els.file?.files?.[0];
  if (!file) {
    alert("Please select a video first!");
    return;
  }

  try {
    els.btn && (els.btn.disabled = true);
    setStatus("Requesting upload URL…");

    // 1) Ask our API for a SAS URL to upload this file
    const getUrlRes = await fetch("/api/videos-upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || "video/mp4",
      }),
    });

    if (!getUrlRes.ok) throw new Error("Failed to get upload URL");
    const { uploadUrl, blobUrl } = await getUrlRes.json();
    if (!uploadUrl || !blobUrl) throw new Error("Upload URL missing from API");

    // 2) PUT the file to Azure Storage using the SAS URL
    setStatus("Uploading to storage…");
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": file.type || "video/mp4",
      },
      body: file,
    });
    if (!putRes.ok) throw new Error("Upload to storage failed");

    // 3) Tell our API about the uploaded video (save metadata)
    setStatus("Registering video…");
    const registerRes = await fetch("/api/videos-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: blobUrl,
        filename: file.name,
        size: file.size,
        type: file.type || "video/mp4",
        uploadedAt: new Date().toISOString(),
      }),
    });
    if (!registerRes.ok) throw new Error("Register failed");

    setStatus("✅ Upload complete! You can now play or list the video.");
  } catch (err) {
    console.error(err);
    setStatus("❌ " + (err?.message || "Upload failed"));
  } finally {
    els.btn && (els.btn.disabled = false);
  }
}

// Attach handler (works whether the button uses onclick or not)
if (els.btn) {
  // If your HTML already has: onclick="uploadVideo()" this is still safe.
  els.btn.addEventListener("click", uploadVideo);
}

// Optional: simple helper to load latest videos (if you build a list page later)
async function loadLatest() {
  try {
    const res = await fetch("/api/video-get"); // your function that lists videos
    if (!res.ok) return;
    const data = await res.json();
    console.log("Latest videos", data);
  } catch (e) {
    console.log("loadLatest error", e);
  }
}
