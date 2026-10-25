(() => {
  const site = window.ULTRASMP_SITE || {};
  const wikiUrl = String(site.wikiUrl || "").trim();

  document.querySelectorAll("[data-wiki-link]").forEach((link) => {
    if (wikiUrl) {
      link.href = wikiUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.removeAttribute("aria-disabled");
      link.removeAttribute("tabindex");
      link.removeAttribute("title");
      return;
    }

    link.setAttribute("aria-disabled", "true");
    link.setAttribute("tabindex", "-1");
    link.setAttribute("title", "La Wiki sarà collegata a breve");
    link.addEventListener("click", (event) => event.preventDefault());
  });

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const page = document.querySelector("[data-pack-page]");
  if (!page) {
    return;
  }

  const pack = site.packs?.[page.dataset.packPage];
  if (!pack) {
    return;
  }

  const fields = {
    name: pack.name,
    version: pack.version,
    release: pack.releaseLabel,
    minecraft: pack.minecraft,
    format: pack.format,
    loader: pack.loader,
    file: pack.file,
    size: pack.size
  };

  Object.entries(fields).forEach(([field, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    page.querySelectorAll(`[data-pack-field="${field}"]`).forEach((element) => {
      element.textContent = String(value);
    });
  });

  const download = page.querySelector("[data-pack-download]");
  if (!download) {
    return;
  }

  const downloadUrl = String(pack.downloadUrl || "").trim();
  if (downloadUrl) {
    download.href = downloadUrl;
    download.download = pack.file;
    download.textContent = `Scarica ${pack.version}`;
    download.classList.remove("is-disabled");
    download.removeAttribute("aria-disabled");
    download.removeAttribute("tabindex");

    const note = page.querySelector(".download-note");
    if (note) {
      note.hidden = true;
    }
    return;
  }

  download.setAttribute("aria-disabled", "true");
  download.setAttribute("tabindex", "-1");
  download.classList.add("is-disabled");
  download.textContent = "Download in arrivo";
  download.addEventListener("click", (event) => event.preventDefault());
})();
