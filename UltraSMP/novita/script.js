const MANIFEST_URL = "data/index.json";
const LINKED_SECTIONS_KEY = "ultrasmp-novita-linked-sections";

const PALETTE = new Set(["#facc15", "#fb923c", "#38bdf8", "#f87171"]);

const KINDS = {
  new: { label: "Novità", color: "#facc15" },
  update: { label: "Modifiche", color: "#fb923c" },
  fix: { label: "Bug fix", color: "#f87171" },
  event: { label: "Eventi", color: "#38bdf8" }
};

const els = {
  serverNames: document.querySelectorAll("[data-server-name]"),
  pageEyebrow: document.getElementById("page-eyebrow"),
  pageSubtitle: document.getElementById("page-subtitle"),
  latestLinkWrap: document.getElementById("latest-link-wrap"),
  latestLink: document.getElementById("latest-link"),
  loadNote: document.getElementById("load-note"),
  announcement: document.getElementById("announcement"),
  selectionStatus: document.getElementById("selection-status"),
  errorState: document.getElementById("error-state"),
  eraTrigger: document.getElementById("era-trigger"),
  eraTriggerLabel: document.getElementById("era-trigger-label"),
  eraDialog: document.getElementById("era-dialog"),
  eraClose: document.getElementById("era-close"),
  eraList: document.getElementById("era-list")
};

function readLinkedSections() {
  try {
    return window.localStorage.getItem(LINKED_SECTIONS_KEY) !== "false";
  } catch {
    return true;
  }
}

function saveLinkedSections(value) {
  try {
    window.localStorage.setItem(LINKED_SECTIONS_KEY, String(value));
  } catch {
  }
}

const state = {
  versions: [],
  latestId: "",
  selectedId: "",
  linkedSections: readLinkedSections()
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const longDateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric"
});

const shortDateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

const escapeHTML = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });

const pluralize = (count, singular, plural) =>
  `${count} ${count === 1 ? singular : plural}`;

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeColor(value) {
  const color = String(value ?? "").trim().toLowerCase();
  return PALETTE.has(color) ? color : "#fb923c";
}

function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12);

  const isValid =
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return isValid ? date : null;
}

function normalizeVersion(raw, index) {
  const dateString = String(raw?.date ?? "").trim();
  const dateValue = parseDate(dateString);
  const launchDateString = String(raw?.launchDate ?? "").trim();
  const launchDateValue = parseDate(launchDateString);
  const rawSections = Array.isArray(raw?.sections) ? raw.sections : [];

  const sections = rawSections
    .map((section) => {
      const kind = KINDS[section?.kind] ? section.kind : "update";
      const items = (Array.isArray(section?.items) ? section.items : [])
        .map((item) => ({
          title: String(item?.title ?? "").trim(),
          text: String(item?.text ?? "").trim(),
          kicker: String(item?.kicker ?? "").trim(),
          meta: String(item?.meta ?? "").trim(),
          image: String(item?.image ?? "").trim(),
          imageAlt: String(item?.imageAlt ?? "").trim(),
          video: String(item?.video ?? "").trim(),
          videoAlt: String(item?.videoAlt ?? "").trim(),
          poster: String(item?.poster ?? "").trim(),
          caption: String(item?.caption ?? "").trim(),
          tags: Array.isArray(item?.tags)
            ? item.tags.map((tag) => String(tag).trim()).filter(Boolean)
            : [],
          commands: Array.isArray(item?.commands)
            ? item.commands
                .map((entry) => ({
                  command: String(entry?.command ?? "").trim(),
                  description: String(entry?.description ?? "").trim()
                }))
                .filter((entry) => entry.command || entry.description)
            : []
        }))
        .filter((item) => item.title || item.text);

      return {
        kind,
        title: String(section?.title ?? KINDS[kind].label).trim() || KINDS[kind].label,
        description: String(section?.description ?? "").trim(),
        items
      };
    })
    .filter((section) => section.items.length);

  return {
    id: "",
    versionLabel: String(raw?.version ?? "").trim() || `BETA-Era${index + 1}`,
    name: String(raw?.name ?? "").trim() || "Senza titolo",
    summary: String(raw?.summary ?? "").trim(),
    signoff: String(raw?.signoff ?? "").trim(),
    cover: String(raw?.cover ?? "").trim(),
    coverAlt: String(raw?.coverAlt ?? "").trim(),
    coverVideo: String(raw?.coverVideo ?? "").trim(),
    coverVideoAlt: String(raw?.coverVideoAlt ?? "").trim(),
    tags: Array.isArray(raw?.tags)
      ? raw.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [],
    accent: normalizeColor(raw?.accent),
    dateValue,
    dateISO: dateValue ? dateString : "",
    dateLabel: dateValue ? longDateFormatter.format(dateValue) : "Data non disponibile",
    launchDateValue,
    launchDateISO: launchDateValue ? launchDateString : "",
    launchDateLabel: launchDateValue ? longDateFormatter.format(launchDateValue) : "",
    shortDate: dateValue ? shortDateFormatter.format(dateValue) : "—",
    sections
  };
}

function assignVersionIds(versions) {
  const used = new Set();

  versions.forEach((version, index) => {
    const base = `version-${slugify(version.versionLabel) || index + 1}`;
    let id = base;
    let suffix = 2;

    while (used.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }

    used.add(id);
    version.id = id;
  });
}

function setServerName(name) {
  const serverName = String(name ?? "").trim() || "UltraSMP";
  els.serverNames.forEach((element) => {
    element.textContent = serverName;
  });
  document.title = `Novità — ${serverName}`;
}

function sortVersions() {
  return [...state.versions].sort((a, b) => {
    if (!a.dateValue && !b.dateValue) {
      return b.versionLabel.localeCompare(a.versionLabel, "it", { numeric: true });
    }
    if (!a.dateValue) {
      return 1;
    }
    if (!b.dateValue) {
      return -1;
    }
    return b.dateValue - a.dateValue;
  });
}

function getLatestVersion() {
  return sortVersions().find((version) => version.dateValue) || state.versions[0] || null;
}

function getHashId() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) {
    return "";
  }

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function getVersionById(id) {
  return state.versions.find((version) => version.id === id) || null;
}

function getVersionByHash() {
  return getVersionById(getHashId());
}

function getDateState(version) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const releaseDay = version.dateValue
    ? new Date(
        version.dateValue.getFullYear(),
        version.dateValue.getMonth(),
        version.dateValue.getDate()
      )
    : null;
  const isFuture = Boolean(releaseDay && releaseDay > today);

  return {
    label: version.dateValue
      ? isFuture
        ? "Data prevista"
        : "Data di pubblicazione"
      : "Data",
    status: version.dateValue
      ? isFuture
        ? "In arrivo"
        : "Pubblicato"
      : "Data da definire"
  };
}

function renderTags(tags, className = "tags") {
  if (!tags.length) {
    return "";
  }

  return `
    <ul class="${className}" aria-label="Tag">
      ${tags.map((tag) => `<li>${escapeHTML(tag)}</li>`).join("")}
    </ul>
  `;
}

function renderMedia(media, { cover = false, overlay = null } = {}) {
  const image = media.image || "";
  const video = media.video || "";
  const poster = media.poster || image;

  if (!image && !video) {
    return "";
  }

  const caption = media.caption || "";
  const label = media.videoAlt || media.imageAlt || caption || "Media della novità";
  const imageMarkup = image
    ? `<img class="media-element" src="${escapeHTML(image)}" alt="${escapeHTML(media.imageAlt || "")}" loading="${cover ? "eager" : "lazy"}" decoding="async">`
    : "";
  const mediaMarkup = video
    ? `<video class="media-element" data-loop-video src="${escapeHTML(video)}"${poster ? ` poster="${escapeHTML(poster)}"` : ""} muted loop playsinline preload="metadata" aria-label="${escapeHTML(label)}"></video>`
    : imageMarkup;
  const toggle = video
    ? `<button class="media-toggle" type="button" data-video-toggle>Riproduci</button>`
    : "";
  const overlayMarkup = overlay && (overlay.label || overlay.title)
    ? `<div class="media-overlay" aria-hidden="true">
        ${overlay.label ? `<span class="media-overlay-label">${escapeHTML(overlay.label)}</span>` : ""}
        ${overlay.title ? `<span class="media-overlay-title">${escapeHTML(overlay.title)}</span>` : ""}
      </div>`
    : "";
  const captionMarkup = caption || video
    ? `<figcaption class="media-caption">
        ${caption ? `<span class="media-caption-text">${escapeHTML(caption)}</span>` : ""}
        ${toggle}
      </figcaption>`
    : "";

  return `
    <figure class="media${cover ? " media-cover" : ""}${video ? " media-video" : ""}">
      <div class="media-frame">${mediaMarkup}${overlayMarkup}</div>
      ${captionMarkup}
    </figure>
  `;
}

function renderCommandTokens(command) {
  return String(command)
    .trim()
    .split(/\s+/)
    .map((token) => {
      const className = /^<[^>]+>$/.test(token) ? "command-placeholder" : "command-name";
      return `<span class="${className}">${escapeHTML(token)}</span>`;
    })
    .join(" ");
}

function renderCommands(commands) {
  if (!commands.length) {
    return "";
  }

  return `
    <div class="command-examples" aria-label="Esempi dei comandi">
      <ul class="command-list">
        ${commands
          .map(
            (entry) => `
          <li class="command-item">
            ${entry.command ? `<code class="command-code">${renderCommandTokens(entry.command)}</code>` : ""}
            ${entry.description ? `<span class="command-description">${escapeHTML(entry.description)}</span>` : ""}
          </li>`
          )
          .join("")}
      </ul>
    </div>
  `;
}

function renderChange(item, kind) {
  const kicker = item.kicker
    ? `<span class="change-kicker">${escapeHTML(item.kicker)}</span>`
    : "";
  const text = item.text
    ? `<p class="change-text">${escapeHTML(item.text)}</p>`
    : "";
  const media = renderMedia(item);
  const commands = renderCommands(item.commands);
  const meta = item.meta
    ? `<span class="change-meta">${escapeHTML(item.meta)}</span>`
    : "";

  return `
    <li class="change" data-kind="${kind}">
      <div class="change-head">
        <h4 class="change-title">${escapeHTML(item.title)}</h4>
        ${kicker}
      </div>
      ${text}
      ${commands}
      ${media}
      ${meta}
      ${renderTags(item.tags)}
    </li>
  `;
}

function renderSection(section, index) {
  const kind = KINDS[section.kind];
  const titleId = `section-title-${index}`;
  const panelId = `section-panel-${index}`;
  const description = section.description
    ? `<p class="section-description">${escapeHTML(section.description)}</p>`
    : "";

  return `
    <section class="release-section" data-kind="${section.kind}" style="--cat:${kind.color}" aria-labelledby="${titleId}">
      <h3 class="section-heading">
        <button class="section-toggle" type="button" data-section-toggle aria-expanded="false" aria-controls="${panelId}">
          <span class="section-dot" aria-hidden="true"></span>
          <span class="section-title" id="${titleId}">${escapeHTML(section.title)}</span>
          <span class="section-count">${pluralize(section.items.length, "modifica", "modifiche")}</span>
          <span class="section-caret" aria-hidden="true"></span>
        </button>
      </h3>
      <div class="section-panel" id="${panelId}" hidden>
        ${description}
        <ul class="change-list">
          ${section.items.map((item) => renderChange(item, section.kind)).join("")}
        </ul>
      </div>
    </section>
  `;
}

function renderNotice(version) {
  const message = version.summary || "Non abbiamo nessun dato a riguardo.";
  const image = version.cover
    ? `<figure class="notice-media">
        <img src="${escapeHTML(version.cover)}" alt="${escapeHTML(version.coverAlt || "")}" width="1200" height="800" loading="eager" decoding="async">
      </figure>`
    : "";

  return `
    <article class="announcement announcement-empty" id="${escapeHTML(version.id)}" style="--era-accent:${version.accent}" aria-labelledby="notice-title">
      <div class="notice">
        ${image}
        <div class="notice-copy">
          <h2 class="notice-title" id="notice-title">${escapeHTML(message)}</h2>
        </div>
      </div>
    </article>
  `;
}

function renderAnnouncement(version) {
  if (!version.sections.length) {
    return renderNotice(version);
  }

  const dateState = getDateState(version);
  const date = version.dateValue
    ? `<time class="release-date" datetime="${escapeHTML(version.dateISO)}">${escapeHTML(version.dateLabel)}</time>`
    : `<span class="release-date">${escapeHTML(version.dateLabel)}</span>`;
  const launchDate = version.launchDateValue
    ? `<span class="meta-date meta-launch">
        <span class="release-date-label">Avvio del server</span>
        <time class="release-date" datetime="${escapeHTML(version.launchDateISO)}">${escapeHTML(version.launchDateLabel)}</time>
      </span>`
    : "";
  const summary = version.summary
    ? `<p class="announcement-summary">${escapeHTML(version.summary)}</p>`
    : "";
  const cover = renderMedia(
    {
      image: version.cover,
      imageAlt: version.coverAlt,
      video: version.coverVideo,
      videoAlt: version.coverVideoAlt
    },
    {
      cover: true,
      overlay: {
        label: version.versionLabel,
        title: version.name
      }
    }
  );
  const signoff = version.signoff
    ? `<p class="signoff">${escapeHTML(version.signoff)}</p>`
    : "";
  const sectionsToolbar = version.sections.length
    ? `<div class="sections-toolbar">
        <p class="sections-label" id="sections-label">Sezioni</p>
        <div class="sections-actions" role="group" aria-labelledby="sections-label">
          <button class="sections-action" type="button" data-collapse-sections hidden>Comprimi tutte</button>
          <button class="sections-action" type="button" data-expand-sections>Espandi tutte</button>
          <button class="sections-action sections-link-toggle" type="button" data-link-sections aria-pressed="${state.linkedSections}" title="Apri una sezione alla volta">
            <span class="sections-link-indicator" aria-hidden="true"></span>
            Sezioni collegate
          </button>
        </div>
      </div>`
    : "";

  return `
    <article class="announcement" id="${escapeHTML(version.id)}" style="--era-accent:${version.accent}">
      <div class="announcement-meta">
        <span class="release-version">${escapeHTML(version.versionLabel)}</span>
        <span class="meta-date">
          <span class="release-date-label">${dateState.label}</span>
          ${date}
        </span>
        ${launchDate}
        <span class="release-status">${dateState.status}</span>
      </div>
      <h2 class="announcement-title">${escapeHTML(version.name)}</h2>
      ${summary}
      ${cover}
      ${renderTags(version.tags)}
      ${sectionsToolbar}
      <div class="release-sections">
        ${version.sections.map(renderSection).join("")}
      </div>
      ${signoff}
    </article>
  `;
}

function renderEraList(selected) {
  els.eraList.innerHTML = sortVersions()
    .map((version) => {
      const current = version.id === selected.id;
      const isLatest = version.id === state.latestId;
      const stateLabel = current ? "In lettura" : isLatest ? "Ultimo" : "";
      const date = version.dateValue
        ? `<time datetime="${escapeHTML(version.dateISO)}">${escapeHTML(version.shortDate)}</time>`
        : `<span class="era-item-date">${escapeHTML(version.shortDate)}</span>`;

      return `
        <a class="era-item" href="#${escapeHTML(version.id)}" data-era-id="${escapeHTML(version.id)}" style="--era-accent:${version.accent}"${current ? ' aria-current="true"' : ""}>
          <span class="era-item-top">
            ${date}
            <span class="era-item-version">${escapeHTML(version.versionLabel)}</span>
          </span>
          <span class="era-item-title">${escapeHTML(version.name)}</span>
          ${stateLabel ? `<span class="era-item-state">${stateLabel}</span>` : ""}
        </a>
      `;
    })
    .join("");
}

function syncVideoToggle(video) {
  const button = video.closest(".media")?.querySelector("[data-video-toggle]");
  if (!button) {
    return;
  }

  const stateLabel = video.paused ? "Riproduci" : "Pausa";
  const label = video.getAttribute("aria-label") || "video della novità";
  button.textContent = stateLabel;
  button.setAttribute("aria-label", `${stateLabel} il video: ${label}`);
}

function initMedia() {
  const videos = els.announcement.querySelectorAll("video[data-loop-video]");

  videos.forEach((video) => {
    if (!video.dataset.mediaReady) {
      video.dataset.mediaReady = "true";
      ["play", "pause", "ended", "loadeddata"].forEach((eventName) => {
        video.addEventListener(eventName, () => syncVideoToggle(video));
      });
    }

    syncVideoToggle(video);

    if (!reduceMotion.matches && !video.closest(".section-panel")?.hidden) {
      const attempt = video.play();
      if (attempt) {
        attempt.catch(() => syncVideoToggle(video));
      }
    }
  });
}

function syncSectionsControls() {
  const toggles = [...els.announcement.querySelectorAll("[data-section-toggle]")];
  const collapseAll = els.announcement.querySelector("[data-collapse-sections]");
  const expandAll = els.announcement.querySelector("[data-expand-sections]");

  if (!collapseAll || !expandAll) {
    return;
  }

  const expanded = toggles.filter((toggle) => toggle.getAttribute("aria-expanded") === "true").length;
  collapseAll.hidden = expanded === 0;
  expandAll.hidden = expanded === toggles.length;
}

function setSectionExpanded(section, expanded) {
  const toggle = section?.querySelector("[data-section-toggle]");
  const panel = section?.querySelector(".section-panel");

  if (!toggle || !panel) {
    return;
  }

  toggle.setAttribute("aria-expanded", String(expanded));
  panel.hidden = !expanded;
  section.classList.toggle("is-collapsed", !expanded);

  const videos = panel.querySelectorAll("video[data-loop-video]");

  if (!expanded) {
    videos.forEach((video) => video.pause());
    return;
  }

  if (reduceMotion.matches) {
    return;
  }

  videos.forEach((video) => {
    if (video.dataset.userPaused === "true") {
      return;
    }

    const attempt = video.play();
    if (attempt) {
      attempt.catch(() => syncVideoToggle(video));
    }
  });
}

function setAllSectionsExpanded(expanded) {
  els.announcement.querySelectorAll(".release-section").forEach((section) => {
    setSectionExpanded(section, expanded);
  });
  syncSectionsControls();
}

function scrollToAnnouncement() {
  window.requestAnimationFrame(() => {
    els.announcement.scrollIntoView({ block: "start", behavior: "auto" });
  });
}

function renderSelection({ id = "", scroll = false } = {}) {
  const selected =
    getVersionById(id) ||
    getVersionByHash() ||
    (getHashId() ? getVersionById(state.selectedId) : null) ||
    state.latestId && getVersionById(state.latestId) ||
    state.versions[0];

  if (!selected) {
    return;
  }

  const latest = getVersionById(state.latestId);
  const isLatest = !latest || selected.id === latest.id;

  state.selectedId = selected.id;
  els.announcement.innerHTML = renderAnnouncement(selected);
  els.announcement.hidden = false;
  els.announcement.setAttribute("aria-busy", "false");
  els.errorState.hidden = true;
  els.pageEyebrow.textContent = isLatest ? "Ultima novità" : "Novità precedente";
  els.pageSubtitle.textContent = isLatest
    ? "L'ultima novità pubblicata sul server."
    : "Stai leggendo una novità precedente.";
  els.latestLinkWrap.hidden = isLatest;
  els.eraTrigger.disabled = false;
  els.eraTriggerLabel.textContent = selected.versionLabel;
  const selectedName = selected.name === selected.versionLabel ? "" : `, ${selected.name}`;
  els.selectionStatus.textContent = `Novità selezionata: ${selected.versionLabel}${selectedName}.`;
  renderEraList(selected);
  initMedia();
  syncSectionsControls();

  if (scroll) {
    scrollToAnnouncement();
  }
}

function scheduleSelectionRender(scroll) {
  window.requestAnimationFrame(() => {
    renderSelection({ scroll });
  });
}

function scrollToLatest() {
  const latest = getVersionById(state.latestId);
  if (!latest) {
    return;
  }

  if (window.location.hash) {
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}`);
  }

  renderSelection({ id: latest.id, scroll: true });
}

function showLoadNote(count) {
  els.loadNote.hidden = false;
  els.loadNote.textContent = `${pluralize(count, "novità non è stata caricata", "novità non sono state caricate")}. Le novità disponibili sono comunque visibili.`;
}

function showError(error) {
  const isFile = window.location.protocol === "file:";
  const message = String(error?.message ?? error ?? "Errore sconosciuto");

  els.announcement.hidden = true;
  els.announcement.innerHTML = "";
  els.announcement.setAttribute("aria-busy", "false");
  els.errorState.hidden = false;
  els.loadNote.hidden = true;
  els.latestLinkWrap.hidden = true;
  els.eraTrigger.disabled = true;
  els.eraTrigger.setAttribute("aria-expanded", "false");
  els.eraTriggerLabel.textContent = "BETA-Era";
  els.pageEyebrow.textContent = "Errore";
  els.pageSubtitle.textContent = "Impossibile caricare le novità.";
  els.selectionStatus.textContent = "Caricamento delle novità non riuscito.";
  els.errorState.innerHTML = `
    <h3>Impossibile caricare le novità</h3>
    <p>${isFile
      ? "La pagina è stata aperta come file locale: i browser bloccano la lettura dei JSON in questa modalità. Avvia un piccolo server HTTP dalla cartella del progetto."
      : "Controlla i file JSON e la loro posizione, poi prova a ricaricare la pagina."}</p>
    ${isFile
      ? `<div class="error-commands">
          <code>./avvia.sh</code>
          <code>python3 -m http.server 8080</code>
        </div>
        <p>Poi apri <code>http://localhost:8080</code> nel browser.</p>`
      : `<p class="error-detail">${escapeHTML(message)}</p>`}
    <button class="button" type="button" data-retry>Riprova</button>
  `;

  console.error("Caricamento novità non riuscito:", error);
}

function openEraDialog() {
  if (!state.versions.length || !getVersionById(state.selectedId)) {
    return;
  }

  if (typeof els.eraDialog.showModal === "function") {
    els.eraDialog.showModal();
  } else {
    els.eraDialog.setAttribute("open", "");
  }

  els.eraTrigger.setAttribute("aria-expanded", "true");

  window.requestAnimationFrame(() => {
    const current = els.eraList.querySelector('[aria-current="true"]');
    (current || els.eraClose).focus();
  });
}

function closeEraDialog() {
  if (els.eraDialog.open && typeof els.eraDialog.close === "function") {
    els.eraDialog.close();
  } else {
    els.eraDialog.removeAttribute("open");
    els.eraTrigger.setAttribute("aria-expanded", "false");
  }
}

function navigateToVersion(id) {
  const version = getVersionById(id);
  if (!version) {
    return;
  }

  if (version.id === state.selectedId) {
    scrollToAnnouncement();
    return;
  }

  if (version.id === state.latestId) {
    scrollToLatest();
    return;
  }

  window.location.hash = version.id;
}

async function loadAnnouncements() {
  els.announcement.setAttribute("aria-busy", "true");

  try {
    const manifestResponse = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (!manifestResponse.ok) {
      throw new Error(`Manifest non disponibile (HTTP ${manifestResponse.status})`);
    }

    const manifest = await manifestResponse.json();
    setServerName(manifest.server);

    const list = Array.isArray(manifest.entries) ? manifest.entries : manifest.annunci;
    const files = (Array.isArray(list) ? list : [])
      .map((file) => String(file).trim())
      .filter(Boolean);

    if (!files.length) {
      throw new Error("Nessuna novità elencata nel manifest.");
    }

    const baseUrl = new URL(MANIFEST_URL, document.baseURI);
    const results = await Promise.allSettled(
      files.map(async (file, index) => {
        const response = await fetch(new URL(file, baseUrl), { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`${file}: HTTP ${response.status}`);
        }
        return normalizeVersion(await response.json(), index);
      })
    );

    const versions = [];
    const errors = [];

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        versions.push(result.value);
      } else {
        errors.push(result.reason);
      }
    });

    if (!versions.length) {
      throw errors[0] ?? new Error("Nessuna novità caricata.");
    }

    assignVersionIds(versions);
    state.versions = versions;

    const latest = getLatestVersion();
    state.latestId = latest ? latest.id : "";

    renderSelection({ scroll: Boolean(getVersionByHash()) });

    if (errors.length) {
      showLoadNote(errors.length);
    } else {
      els.loadNote.hidden = true;
    }
  } catch (error) {
    showError(error);
  }
}

function initEvents() {
  els.eraTrigger.addEventListener("click", openEraDialog);
  els.eraClose.addEventListener("click", closeEraDialog);

  els.eraDialog.addEventListener("close", () => {
    els.eraTrigger.setAttribute("aria-expanded", "false");
  });

  els.eraDialog.addEventListener("click", (event) => {
    if (event.target !== els.eraDialog) {
      return;
    }

    const rect = els.eraDialog.getBoundingClientRect();
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if (outside) {
      closeEraDialog();
    }
  });

  els.eraList.addEventListener("click", (event) => {
    const link = event.target.closest("[data-era-id]");
    if (!link) {
      return;
    }

    event.preventDefault();
    const id = link.dataset.eraId;
    closeEraDialog();
    navigateToVersion(id);
  });

  els.latestLink.addEventListener("click", (event) => {
    event.preventDefault();
    scrollToLatest();
  });

  els.announcement.addEventListener("click", (event) => {
    const sectionToggle = event.target.closest("[data-section-toggle]");
    if (sectionToggle) {
      const section = sectionToggle.closest(".release-section");
      const expanded = sectionToggle.getAttribute("aria-expanded") !== "true";

      if (expanded && state.linkedSections) {
        els.announcement.querySelectorAll(".release-section").forEach((other) => {
          if (other !== section) {
            setSectionExpanded(other, false);
          }
        });
      }

      setSectionExpanded(section, expanded);
      syncSectionsControls();
      return;
    }

    const linkSections = event.target.closest("[data-link-sections]");
    if (linkSections) {
      state.linkedSections = !state.linkedSections;
      saveLinkedSections(state.linkedSections);
      linkSections.setAttribute("aria-pressed", String(state.linkedSections));
      return;
    }

    const collapseAll = event.target.closest("[data-collapse-sections]");
    if (collapseAll) {
      setAllSectionsExpanded(false);
      return;
    }

    const expandAll = event.target.closest("[data-expand-sections]");
    if (expandAll) {
      setAllSectionsExpanded(true);
      return;
    }

    const button = event.target.closest("[data-video-toggle]");
    if (!button) {
      return;
    }

    const video = button.closest(".media")?.querySelector("video[data-loop-video]");
    if (!video) {
      return;
    }

    if (video.paused) {
      video.dataset.userPaused = "false";
      const attempt = video.play();
      if (attempt) {
        attempt.catch(() => syncVideoToggle(video));
      }
    } else {
      video.dataset.userPaused = "true";
      video.pause();
    }
  });

  const handleMotionChange = (event) => {
    if (!event.matches) {
      return;
    }

    els.announcement.querySelectorAll("video[data-loop-video]").forEach((video) => {
      video.pause();
    });
  };

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", handleMotionChange);
  } else {
    reduceMotion.addListener(handleMotionChange);
  }

  window.addEventListener("hashchange", () => {
    const hashId = getHashId();
    if (hashId && !getVersionByHash()) {
      return;
    }
    scheduleSelectionRender(Boolean(hashId));
  });

  window.addEventListener("popstate", () => {
    const hashId = getHashId();
    if (hashId && !getVersionByHash()) {
      return;
    }
    scheduleSelectionRender(Boolean(hashId));
  });

  els.errorState.addEventListener("click", (event) => {
    if (event.target.closest("[data-retry]")) {
      window.location.reload();
    }
  });
}

function init() {
  initEvents();
  loadAnnouncements();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
