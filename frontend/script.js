function uploadVideo() {
  const input = document.getElementById('videoInput');
  if (!input.files.length) {
    alert('Please select a video first!');
    return;
  }
  alert('Pretend uploading: ' + input.files[0].name);
}