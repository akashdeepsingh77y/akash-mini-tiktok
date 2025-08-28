// ------- Student-friendly Mini TikTok front-end -------
// Features: choose file, preview video, basic validation, upload flow.
// If your API is not fully wired yet, we fall back to DEMO mode with friendly messages.

const fileInput = document.getElementById("videoFile");
const uploadBtn = document.getElementById("uploadBtn");
const statusEl = document.getElementById("status");
const previewEl = document.getElementById("preview");

// ---- Config you can tweak
const MAX_MB = 20;                       // max upload size for students
const API_UPLOAD_URL = "/api/videos-upload-url";  // should exist in your repo
const API_REGISTER   = "/api/videos-register";    // should exist in your repo

function setStatus(msg, type = "info") {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
}

// Show preview as soon as a video is selected
fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (!file) {
    setStatus("No file selected.", "warn");
    previewEl.removeAttribute("src");
    previewEl.style.display = "none";
    return;
  }

  // Basic checks: type + size
  if (!file.type.startsWith("video/")) {
    setStatus("Please choose a video file (mp4, webm, etc.).", "error");
    fileInput.value = "";
    return;
  }
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_MB) {
    setStatus(`File is ${sizeMB.toFixed(1)} MB. Max allowed is ${MAX_MB} MB.`, "error");
    fileInput.value = "";
    return;
  }

  // Local preview
  previewEl.src = URL.createObjectURL(file);
  previewEl.style.display = "block";
  setStatus("Preview ready. Click Upload to continue.", "ok");
});

uploadBtn.addEventListener("click", () => uploadVideo());

async function uploadVideo() {
  const file = fileInput.files?.[0];
  if (!file) {
    alert("Please select a video first!");
    return;
  }

  try {
    setStatus("Requesting secure upload URL…", "info");

    // 1) Ask backend for a pre-signed (SAS) URL to upload the file
    const meta = {
      filename: file.name,
      contentType: file.type || "video/mp4",
      size: file.size
    };

    const res = await fetch(API_UPLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meta)
    });

    if (!res.ok) {
      // If API not wired yet, go to demo mode
      setStatus("Backend upload URL not available — demo mode active. Simulating upload…", "warn");
      await demoWait(1500);
      setStatus("Demo upload complete ✅ (no file actually uploaded).", "ok");
      return;
    }

    const { uploadUrl, blobUrl } = await res.json(); // your function should return these

    if (!uploadUrl) {
      setStatus("Upload URL not received from server.", "error");
      return;
    }

    // 2) PUT the video file to storage (SAS URL)
    setStatus("Uploading video to storage…", "info");
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "x-ms-blob-type": "BlockBlob", "Content-Type": file.type || "application/octet-stream" },
      body: file
    });

    if (!putRes.ok) {
      setStatus("Upload to storage failed.", "error");
      return;
    }

    // 3) Tell backend to register/save this video info
    // (Optional while prototyping)
    if (blobUrl) {
      setStatus("Registering video metadata…", "info");
      await fetch(API_REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: blobUrl, filename: file.name, size: file.size })
      });
    }

    setStatus("Upload complete ✅ Your video is stored!", "ok");
  } catch (err) {
    console.error(err);
    setStatus("Unexpected error. Check console and API functions.", "error");
  }
}

function demoWait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
