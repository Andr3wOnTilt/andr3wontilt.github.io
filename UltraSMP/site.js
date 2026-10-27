(() => {
  const site = window.ULTRASMP_SITE || {};
  const wikiUrl = String(site.wikiUrl || "").trim();

  // Auth system
  const AUTH_KEY = "ultrasmp-auth";
  const AUTH_CREDENTIALS = {
    username: "admin",
    password: "ultrasmpdeveloper"
  };

  const getAuthState = () => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  };

  const setAuthState = (state) => {
    try {
      if (state) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(state));
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    } catch (error) {}
  };

  const createAuthUI = () => {
    const headerInners = document.querySelectorAll(".header-inner");
    if (headerInners.length === 0) return;

    // Add auth container to header if not exists
    headerInners.forEach((headerInner) => {
      if (headerInner.querySelector(".auth-container")) return;

      const authContainer = document.createElement("div");
      authContainer.className = "auth-container";
      headerInner.appendChild(authContainer);

      const authState = getAuthState();
      if (authState && authState.loggedIn && authState.username === "admin") {
        // Show admin avatar with logout option
        const avatarBtn = document.createElement("button");
        avatarBtn.className = "auth-avatar-btn";
        avatarBtn.type = "button";
        avatarBtn.setAttribute("aria-label", "Menu account");
        avatarBtn.innerHTML = '<span class="auth-avatar">A</span>';

        const logoutPopup = document.createElement("div");
        logoutPopup.className = "auth-popup auth-logout-popup";
        logoutPopup.innerHTML = `
          <div class="auth-popup-backdrop"></div>
          <div class="auth-popup-content">
            <div class="auth-popup-header">
              <span class="auth-popup-title">Account</span>
              <button class="auth-popup-close" type="button" aria-label="Chiudi">×</button>
            </div>
            <div class="auth-popup-body">
              <div class="auth-user-info">
                <span class="auth-avatar-large">A</span>
                <span class="auth-username">admin</span>
              </div>
              <button class="auth-logout-btn" type="button">Disconnetti</button>
            </div>
          </div>
        `;

        authContainer.appendChild(avatarBtn);
        document.body.appendChild(logoutPopup);

        avatarBtn.addEventListener("click", () => {
          logoutPopup.classList.add("is-open");
        });

        logoutPopup.querySelector(".auth-popup-backdrop").addEventListener("click", () => {
          logoutPopup.classList.remove("is-open");
        });

        logoutPopup.querySelector(".auth-popup-close").addEventListener("click", () => {
          logoutPopup.classList.remove("is-open");
        });

        logoutPopup.querySelector(".auth-logout-btn").addEventListener("click", () => {
          setAuthState(null);
          logoutPopup.classList.remove("is-open");
          createAuthUI();
        });
      } else {
        // Show login button
        const loginBtn = document.createElement("button");
        loginBtn.className = "auth-login-btn";
        loginBtn.type = "button";
        loginBtn.textContent = "Accedi";

        const loginPopup = document.createElement("div");
        loginPopup.className = "auth-popup auth-login-popup";
        loginPopup.innerHTML = `
          <div class="auth-popup-backdrop"></div>
          <div class="auth-popup-content">
            <div class="auth-popup-header">
              <span class="auth-popup-title">Accedi</span>
              <button class="auth-popup-close" type="button" aria-label="Chiudi">×</button>
            </div>
            <div class="auth-popup-body">
              <form class="auth-form" novalidate>
                <div class="auth-field">
                  <label class="auth-label" for="auth-username">Username</label>
                  <input class="auth-input" id="auth-username" name="username" type="text" autocomplete="username" required>
                </div>
                <div class="auth-field">
                  <label class="auth-label" for="auth-password">Password</label>
                  <input class="auth-input" id="auth-password" name="password" type="password" autocomplete="current-password" required>
                </div>
                <div class="auth-error" hidden></div>
                <button class="auth-submit-btn" type="submit">Accedi</button>
              </form>
            </div>
          </div>
        `;

        authContainer.appendChild(loginBtn);
        document.body.appendChild(loginPopup);

        loginBtn.addEventListener("click", () => {
          loginPopup.classList.add("is-open");
          setTimeout(() => {
            loginPopup.querySelector("#auth-username").focus();
          }, 100);
        });

        loginPopup.querySelector(".auth-popup-backdrop").addEventListener("click", () => {
          loginPopup.classList.remove("is-open");
        });

        loginPopup.querySelector(".auth-popup-close").addEventListener("click", () => {
          loginPopup.classList.remove("is-open");
        });

        const authForm = loginPopup.querySelector(".auth-form");
        const authError = loginPopup.querySelector(".auth-error");

        authForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const formData = new FormData(authForm);
          const username = formData.get("username");
          const password = formData.get("password");

          if (username === AUTH_CREDENTIALS.username && password === AUTH_CREDENTIALS.password) {
            setAuthState({ loggedIn: true, username: username });
            loginPopup.classList.remove("is-open");
            authForm.reset();
            authError.hidden = true;
            createAuthUI();
          } else {
            authError.textContent = "Credenziali non valide";
            authError.hidden = false;
          }
        });
      }
    });
  };

  // Initialize auth UI
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createAuthUI);
  } else {
    createAuthUI();
  }

  const THEME_KEY = "ultrasmp-theme";
  const THEME_TRANSITION_MS = 320;
  const themeButtons = Array.from(document.querySelectorAll("[data-theme-set]"));
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  let themeTransitionTimer;

  const applyTheme = (value, persist = true, animate = false) => {
    const theme = value === "light" ? "light" : "dark";
    const root = document.documentElement;
    const changed = root.dataset.theme !== theme;

    if (animate && changed) {
      root.classList.add("theme-transition");
      window.clearTimeout(themeTransitionTimer);
      void root.offsetWidth;
      themeTransitionTimer = window.setTimeout(() => {
        root.classList.remove("theme-transition");
      }, THEME_TRANSITION_MS + 80);
    }

    root.dataset.theme = theme;
    window.ULTRASMP_THEME = theme;

    if (themeMeta) {
      themeMeta.setAttribute("content", theme === "light" ? "#f6f5f2" : "#090909");
    }

    themeButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeSet === theme));
    });

    if (persist) {
      try {
        window.localStorage.setItem(THEME_KEY, theme);
      } catch (error) {}
    }
  };

  applyTheme(window.ULTRASMP_THEME || document.documentElement.dataset.theme || "dark");

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => applyTheme(button.dataset.themeSet, true, true));
  });

  window.addEventListener("storage", (event) => {
    if (event.key === THEME_KEY && event.newValue) {
      applyTheme(event.newValue, false, true);
    }
  });

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
