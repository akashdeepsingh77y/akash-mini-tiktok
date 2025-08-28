// --- Mini TikTok frontend script ---
async function fetchVideos() {
  const container = document.getElementById("feed");
  container.innerHTML = "<p>Loading videos...</p>";

  try {
    const res = await fetch("/api/video-get");
    const videos = await res.json();

    container.innerHTML = "";
    videos.forEach(v => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${v.title}</h3>
        <video src="${v.url}" controls></video>
        <p class="small">Uploader: ${v.userId}</p>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = "<p>Error loading videos.</p>";
    console.error(err);
  }
}

// Upload new video (basic demo)
async function uploadVideo() {
  const fileInput = document.getElementById("videoFile");
  const titleInput = document.getElementById("videoTitle");

  if (!fileInput.files[0] || !titleInput.value) {
    alert("Please select a file and enter a title.");
    return;
  }

  alert("In real app: file would be uploaded to /api/videos-upload-url");
}

// Load videos on page start
window.onload = fetchVideos;
