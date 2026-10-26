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

  const choiceButton = page.querySelector("[data-download-choice]");
  const choiceDialog = page.querySelector("#download-dialog");
  if (choiceButton && choiceDialog) {
    const supportsDialog = typeof choiceDialog.showModal === "function";

    choiceButton.addEventListener("click", (event) => {
      if (!supportsDialog) {
        return;
      }
      event.preventDefault();
      if (!choiceDialog.open) {
        choiceDialog.showModal();
      }
    });

    choiceDialog.addEventListener("click", (event) => {
      if (event.target === choiceDialog) {
        choiceDialog.close();
      }
    });

    choiceDialog.querySelectorAll("[data-download-option]").forEach((option) => {
      option.addEventListener("click", () => choiceDialog.close());
    });

    const variantPicker = page.querySelector("[data-variant-picker]");
    if (variantPicker) {
      const variants = pack.variants && typeof pack.variants === "object" ? pack.variants : {};
      const defaultVariant = String(pack.defaultVariant || "").trim();
      const variantTrigger = variantPicker.querySelector("[data-variant-trigger]");
      const variantMenu = variantPicker.querySelector("[data-variant-menu]");
      const variantValue = variantPicker.querySelector("[data-variant-value]");
      const variantOptions = Array.from(variantPicker.querySelectorAll("[data-variant-option]"));
      let closeTimer = 0;

      const setMenuOpen = (open, focusTarget) => {
        window.clearTimeout(closeTimer);

        if (open) {
          variantMenu.hidden = false;
          window.requestAnimationFrame(() => variantPicker.classList.add("is-open"));
          variantTrigger.setAttribute("aria-expanded", "true");
          if (focusTarget) {
            focusTarget.focus();
          }
          return;
        }

        variantPicker.classList.remove("is-open");
        variantTrigger.setAttribute("aria-expanded", "false");
        closeTimer = window.setTimeout(() => {
          variantMenu.hidden = true;
        }, 180);
      };

      const applyVariant = (key) => {
        const variant = variants[key];
        if (!variant) {
          return;
        }

        const label = String(variant.label || key);
        if (variantValue) {
          variantValue.textContent = label;
        }

        page.querySelectorAll("[data-download-variant-label]").forEach((element) => {
          element.textContent = label;
        });

        variantOptions.forEach((option) => {
          option.setAttribute("aria-selected", String(option.dataset.variantOption === key));
        });

        [
          ["import", variant.importFile],
          ["jars", variant.modsFile]
        ].forEach(([choice, file]) => {
          const option = page.querySelector(`[data-download-option="${choice}"]`);
          const fileName = String(file || "").trim();
          if (!option || !fileName) {
            return;
          }

          option.href = new URL(fileName, option.href).href;
          option.download = fileName;

          const fileLabel = option.querySelector("[data-download-file]");
          if (fileLabel) {
            fileLabel.textContent = fileName;
          }
        });
      };

      variantOptions.forEach((option, index) => {
        const key = option.dataset.variantOption;
        const variantLabel = variants[key] && String(variants[key].label || key);
        const optionLabel = option.querySelector("[data-variant-option-label]");
        if (variantLabel && optionLabel) {
          optionLabel.textContent = variantLabel;
        }

        option.addEventListener("click", () => {
          applyVariant(key);
          setMenuOpen(false);
          variantTrigger.focus();
        });

        option.addEventListener("keydown", (event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const direction = event.key === "ArrowDown" ? 1 : -1;
            const nextIndex = (index + direction + variantOptions.length) % variantOptions.length;
            variantOptions[nextIndex].focus();
          } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            variantOptions[event.key === "Home" ? 0 : variantOptions.length - 1].focus();
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            option.click();
          } else if (event.key === "Escape") {
            event.preventDefault();
            setMenuOpen(false);
            variantTrigger.focus();
          } else if (event.key === "Tab") {
            setMenuOpen(false);
          }
        });
      });

      variantTrigger.addEventListener("click", () => {
        setMenuOpen(!variantPicker.classList.contains("is-open"));
      });

      variantTrigger.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const selectedIndex = variantOptions.findIndex((option) => option.getAttribute("aria-selected") === "true");
          const targetIndex = event.key === "ArrowUp" ? variantOptions.length - 1 : Math.max(selectedIndex, 0);
          setMenuOpen(true, variantOptions[targetIndex]);
        } else if (event.key === "Escape" && variantPicker.classList.contains("is-open")) {
          event.preventDefault();
          setMenuOpen(false);
        }
      });

      document.addEventListener("click", (event) => {
        if (variantPicker.classList.contains("is-open") && !variantPicker.contains(event.target)) {
          setMenuOpen(false);
        }
      });

      choiceDialog.addEventListener("close", () => setMenuOpen(false));

      const selectedOption = variantOptions.find((option) => option.getAttribute("aria-selected") === "true");
      const initialVariant = defaultVariant
        || (selectedOption && selectedOption.dataset.variantOption)
        || (variantOptions[0] && variantOptions[0].dataset.variantOption);
      if (initialVariant) {
        applyVariant(initialVariant);
      }
    }
  }

  const download = page.querySelector("[data-pack-download]");
  if (!download) {
    return;
  }

  const downloadUrl = String(pack.downloadUrl || "").trim();
  if (downloadUrl) {
    const downloadLabel = String(pack.downloadLabel || "").trim();
    download.href = downloadUrl;
    download.download = pack.file;
    download.textContent = downloadLabel || (pack.version ? `Scarica ${pack.version}` : "Scarica");
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
