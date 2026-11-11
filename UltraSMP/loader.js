(() => {
  const script = document.currentScript;
  const base = script ? new URL(".", script.src) : new URL("./", window.location.href);
  const logoUrl = new URL("images/lp-icon.png", base).href;
  const siteRootUrl = new URL("./", base).href;
  const root = document.documentElement;
  const TRANSITION_KEY = "ultrasmp-page-transition";
  const isAdminPanel = /\/admin(?:\/|$)/.test(window.location.pathname);

  const isAdmin = (() => {
    try {
      const raw = localStorage.getItem("ultrasmp-auth");
      const state = raw ? JSON.parse(raw) : null;
      return Boolean(state && state.loggedIn && state.username === "admin");
    } catch (error) {
      return false;
    }
  })();

  if (isAdminPanel && !isAdmin) {
    return;
  }

  const reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const introDuration = reduceMotion ? 650 : 1700;
  const goodbyeLead = reduceMotion ? 450 : 850;
  const revealDuration = reduceMotion ? 220 : 400;

  const hasTransition = (() => {
    try {
      return sessionStorage.getItem(TRANSITION_KEY) === "1";
    } catch (error) {
      return false;
    }
  })();

  if (hasTransition) {
    try {
      sessionStorage.removeItem(TRANSITION_KEY);
    } catch (error) {}
  }

  const ensureStyles = () => {
    if (document.getElementById("site-loader-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "site-loader-styles";
    style.textContent = [
      "html.is-site-loading{overflow:hidden}",
      "#site-loader{position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px}",
      "#site-loader .site-loader-bg{position:absolute;inset:0;background:var(--bg,#090909);animation:site-loader-bg var(--loader-duration,1700ms) ease-in-out both}",
      "#site-loader .site-loader-stage{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;width:clamp(80px,11vw,104px);height:clamp(80px,11vw,104px)}",
      "#site-loader .site-loader-logo{position:relative;z-index:1;display:block;width:100%;height:auto;filter:drop-shadow(0 0 28px rgba(56,189,248,0.28));animation:site-loader-logo var(--loader-logo-duration,1700ms) cubic-bezier(0.22,1,0.36,1) both}",
      "#site-loader .site-loader-burst{position:absolute;inset:0;z-index:0;border:2px solid rgba(56,189,248,0.55);border-radius:50%;opacity:0;animation:site-loader-burst var(--loader-logo-duration,1700ms) cubic-bezier(0.16,1,0.3,1) both}",
      "#site-loader .site-loader-text{margin:0;position:relative;z-index:1;color:var(--text,#f5f5f5);font-family:var(--font-sans,ui-sans-serif,system-ui,sans-serif);font-size:clamp(0.95rem,2.4vw,1.2rem);font-weight:600;letter-spacing:0.02em;text-align:center;animation:site-loader-text var(--loader-logo-duration,1700ms) ease both}",
      "#site-loader.is-goodbye .site-loader-bg{animation:none;opacity:1}",
      "#site-reveal{position:fixed;inset:0;z-index:2147483647;background:var(--bg,#090909);pointer-events:none;opacity:1;transition:opacity var(--reveal-duration,400ms) ease-out}",
      "#site-reveal.is-fading{opacity:0}",
      "@keyframes site-loader-bg{0%,80%{opacity:1}100%{opacity:0}}",
      "@keyframes site-loader-logo{0%{opacity:0;transform:scale(0.62)}22%{opacity:1;transform:scale(1.06)}34%{transform:scale(0.98)}44%,64%{opacity:1;transform:scale(1)}72%{opacity:0.95;transform:scale(1.35)}100%{opacity:0;transform:scale(3)}}",
      "@keyframes site-loader-burst{0%,64%{opacity:0;transform:scale(0.5)}70%{opacity:0.9;transform:scale(1)}100%{opacity:0;transform:scale(3.2)}}",
      "@keyframes site-loader-text{0%,12%{opacity:0;transform:translateY(10px)}24%,58%{opacity:1;transform:translateY(0)}70%{opacity:0;transform:translateY(-6px)}100%{opacity:0}}",
      "@media (prefers-reduced-motion:reduce){#site-loader .site-loader-bg,#site-loader .site-loader-logo,#site-loader .site-loader-text{animation-name:site-loader-reduced}#site-loader .site-loader-burst{display:none}@keyframes site-loader-reduced{0%,60%{opacity:1}100%{opacity:0}}}"
    ].join("");
    document.head.appendChild(style);
  };

  const coverLoader = (overlay) => {
    const background = overlay.querySelector(".site-loader-bg");
    if (background) {
      background.style.animation = "none";
      background.style.opacity = "1";
    }
  };

  const showLoader = (text, options = {}) => {
    ensureStyles();

    const existing = document.querySelector(".site-loader");
    if (existing) {
      existing.remove();
    }

    const variant = options.variant === "goodbye" ? "goodbye" : "intro";
    const duration = options.duration || (variant === "goodbye" ? goodbyeLead : introDuration);
    const navigateAt =
      typeof options.navigateAt === "number"
        ? options.navigateAt
        : variant === "goodbye"
          ? duration
          : duration + 80;

    const overlay = document.createElement("div");
    overlay.id = "site-loader";
    overlay.className = "site-loader" + (variant === "goodbye" ? " is-goodbye" : "");
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.setProperty("--loader-duration", duration + "ms");
    overlay.style.setProperty("--loader-logo-duration", duration + "ms");

    const background = document.createElement("div");
    background.className = "site-loader-bg";

    const stage = document.createElement("div");
    stage.className = "site-loader-stage";

    const burst = document.createElement("span");
    burst.className = "site-loader-burst";

    const image = document.createElement("img");
    image.className = "site-loader-logo";
    image.src = logoUrl;
    image.alt = "";
    image.width = 104;
    image.height = 104;
    image.decoding = "async";

    stage.append(burst, image);
    overlay.append(background, stage);

    if (text) {
      const label = document.createElement("p");
      label.className = "site-loader-text";
      label.textContent = text;
      overlay.append(label);
    }

    root.classList.add("is-site-loading");
    root.appendChild(overlay);

    if (typeof options.onDone === "function") {
      window.setTimeout(() => options.onDone(overlay), navigateAt);
    }

    window.setTimeout(() => {
      overlay.remove();
      if (!document.querySelector(".site-loader")) {
        root.classList.remove("is-site-loading");
      }
    }, duration + 400);
  };

  const showReveal = () => {
    ensureStyles();

    const reveal = document.createElement("div");
    reveal.id = "site-reveal";
    reveal.className = "site-reveal";
    reveal.setAttribute("aria-hidden", "true");
    reveal.style.setProperty("--reveal-duration", revealDuration + "ms");
    root.appendChild(reveal);

    let started = false;
    const fade = () => {
      if (started) {
        return;
      }
      started = true;
      reveal.classList.add("is-fading");
    };

    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => window.requestAnimationFrame(fade));
    }
    window.setTimeout(fade, 160);
    window.setTimeout(() => reveal.remove(), revealDuration + 600);
  };

  if (!isAdminPanel) {
    if (hasTransition) {
      showReveal();
    }
    return;
  }

  showLoader("Bentornato Admin", { variant: "intro" });

  let leaving = false;

  const shouldHandleLink = (anchor) => {
    if (!anchor || !anchor.href) {
      return false;
    }

    if (anchor.hasAttribute("download")) {
      return false;
    }

    const target = (anchor.getAttribute("target") || "").toLowerCase();
    if (target && target !== "_self") {
      return false;
    }

    let url;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch (error) {
      return false;
    }

    if (url.origin !== window.location.origin) {
      return false;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    if (/\/admin(?:\/|$)/.test(url.pathname)) {
      return false;
    }

    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search &&
      url.hash
    ) {
      return false;
    }

    return true;
  };

  const leaveAdmin = (destination) => {
    leaving = true;
    showLoader("Arrivederci Admin", {
      variant: "goodbye",
      onDone: (overlay) => {
        coverLoader(overlay);
        try {
          sessionStorage.setItem(TRANSITION_KEY, "1");
        } catch (error) {}
        window.location.href = destination;
      }
    });
  };

  document.addEventListener(
    "click",
    (event) => {
      if (leaving || event.defaultPrevented) {
        return;
      }

      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = event.target.closest ? event.target.closest("a[href]") : null;
      if (!shouldHandleLink(anchor)) {
        return;
      }

      event.preventDefault();
      leaveAdmin(anchor.href);
    },
    true
  );

  document.addEventListener(
    "click",
    (event) => {
      if (leaving || event.defaultPrevented) {
        return;
      }

      const target = event.target;
      const logout = target && target.closest ? target.closest(".auth-logout-btn") : null;
      if (!logout) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      leaving = true;

      showLoader("Arrivederci Admin", {
        variant: "goodbye",
        onDone: (overlay) => {
          coverLoader(overlay);
          try {
            localStorage.removeItem("ultrasmp-auth");
          } catch (error) {}
          try {
            sessionStorage.setItem(TRANSITION_KEY, "1");
          } catch (error) {}
          window.location.href = siteRootUrl;
        }
      });
    },
    true
  );
})();
