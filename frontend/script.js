// Upload video preview
function uploadVideo() {
  const fileInput = document.getElementById("videoUpload");
  const videoPlayer = document.getElementById("videoPlayer");

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    videoPlayer.src = URL.createObjectURL(file);
    alert("Video uploaded successfully!");
  } else {
    alert("Please select a video first.");
  }
}

// Ratings
let likes = 0, dislikes = 0;

function addLike() {
  likes++;
  updateRating();
}

function addDislike() {
  dislikes++;
  updateRating();
}

function updateRating() {
  document.getElementById("ratingBox").innerText = `👍 ${likes} | 👎 ${dislikes}`;
}

// Comments
function postComment() {
  const commentBox = document.getElementById("commentBox");
  const commentsList = document.getElementById("commentsList");

  if (commentBox.value.trim() !== "") {
    const p = document.createElement("p");
    p.innerText = commentBox.value;
    commentsList.appendChild(p);
    commentBox.value = "";
  } else {
    alert("Comment cannot be empty!");
  }
}

