(() => {
  const SEEN_KEY = "ultrasmp-coming-soon-seen";
  const downloadButtons = document.querySelectorAll("[data-admin-download-open]");
  const downloadDialog = document.querySelector("#admin-download-dialog");
  const comingSoonButton = document.querySelector("[data-coming-soon]");
  const videoDialog = document.querySelector("#admin-video-dialog");
  const video = document.querySelector("#admin-video");
  const videoCloseButton = document.querySelector("[data-video-close]");
  let comingSoonClicks = 0;
  let closingVideo = false;

  const readSeen = () => {
    try {
      return localStorage.getItem(SEEN_KEY) === "1";
    } catch (error) {
      return false;
    }
  };

  const markSeen = () => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch (error) {}
  };

  const openDialog = (dialog) => {
    if (!dialog) {
      return;
    }

    if (typeof dialog.showModal === "function") {
      if (!dialog.open) {
        dialog.showModal();
      }
      return;
    }

    dialog.setAttribute("open", "");
  };

  downloadButtons.forEach((button) => {
    button.addEventListener("click", () => openDialog(downloadDialog));
  });

  if (downloadDialog) {
    downloadDialog.addEventListener("click", (event) => {
      if (event.target === downloadDialog) {
        downloadDialog.close();
      }
    });
  }

  const playVideo = () => {
    if (!video) {
      return;
    }

    const attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  };

  const stopVideo = () => {
    if (!video) {
      return;
    }

    try {
      video.pause();
      video.currentTime = 0;
    } catch (error) {}
  };

  const closeVideo = () => {
    closingVideo = true;
    if (videoDialog && videoDialog.open) {
      videoDialog.close();
    }
    stopVideo();
    markSeen();
    closingVideo = false;
  };

  if (comingSoonButton && videoDialog && video) {
    if (readSeen()) {
      comingSoonButton.classList.add("is-used");
      comingSoonButton.setAttribute("aria-disabled", "true");
    }

    comingSoonButton.addEventListener("click", () => {
      if (readSeen()) {
        return;
      }

      comingSoonClicks += 1;

      if (comingSoonClicks < 4) {
        return;
      }

      comingSoonClicks = 0;
      markSeen();
      openDialog(videoDialog);
      playVideo();
    });

    videoDialog.addEventListener("cancel", (event) => event.preventDefault());
    videoDialog.addEventListener("contextmenu", (event) => event.preventDefault());
    video.addEventListener("contextmenu", (event) => event.preventDefault());
    video.addEventListener("pause", () => {
      if (!closingVideo && videoDialog.open) {
        playVideo();
      }
    });
  }

  if (videoCloseButton) {
    videoCloseButton.addEventListener("click", closeVideo);
  }
})();
