(() => {
  const card = document.querySelector("[data-latest-announcement]");
  if (!card) {
    return;
  }

  const base = new URL(card.dataset.latestBase || "novita/data/", document.baseURI);
  const manifestUrl = new URL("index.json", base);
  const pageUrl = new URL("../", base);
  const note = document.querySelector("[data-latest-note]");

  const longDate = new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const slugify = (value) =>
    String(value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  function parseDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? "").trim());
    if (!match) {
      return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day, 12);

    if (
      Number.isNaN(date.getTime()) ||
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  function statusFor(date) {
    if (!date) {
      return { label: "Data da definire", state: "" };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return date > today
      ? { label: "In arrivo", state: "future" }
      : { label: "Pubblicato", state: "past" };
  }

  function setText(selector, value) {
    card.querySelectorAll(selector).forEach((element) => {
      element.textContent = value;
    });
  }

  function render(entry) {
    const version = String(entry.data.version ?? "").trim() || "BETA-Era";
    const name = String(entry.data.name ?? "").trim() || "Ultima novità";
    const summary = String(entry.data.summary ?? "").trim();
    const status = statusFor(entry.date);
    const id = `version-${slugify(version) || "ultimo"}`;

    setText('[data-latest-field="version"]', version);
    setText('[data-latest-field="status"]', status.label);
    setText("[data-latest-name]", name);

    const statusElement = card.querySelector('[data-latest-field="status"]');
    if (statusElement) {
      if (status.state) {
        statusElement.dataset.state = status.state;
      } else {
        delete statusElement.dataset.state;
      }
    }

    const dateElement = card.querySelector("[data-latest-date]");
    if (dateElement) {
      dateElement.textContent = entry.date
        ? longDate.format(entry.date)
        : "Data da definire";
      if (entry.rawDate) {
        dateElement.setAttribute("datetime", entry.rawDate);
      } else {
        dateElement.removeAttribute("datetime");
      }
    }

    const summaryElement = card.querySelector('[data-latest-field="summary"]');
    if (summaryElement) {
      summaryElement.textContent = summary;
      summaryElement.hidden = !summary;
    }

    const announcementUrl = new URL(`#${encodeURIComponent(id)}`, pageUrl).href;
    card.querySelectorAll("[data-latest-link]").forEach((link) => {
      link.href = announcementUrl;
    });

    const eyebrow = document.querySelector("[data-latest-eyebrow]");
    if (eyebrow) {
      eyebrow.textContent = `Ultima novità · ${version}`;
    }

    card.setAttribute("aria-busy", "false");
  }

  async function load() {
    try {
      const manifestResponse = await fetch(manifestUrl, { cache: "no-store" });
      if (!manifestResponse.ok) {
        throw new Error(`Manifest non disponibile (HTTP ${manifestResponse.status})`);
      }

      const manifest = await manifestResponse.json();
      const list = Array.isArray(manifest.entries) ? manifest.entries : manifest.annunci;
      const files = (Array.isArray(list) ? list : [])
        .map((file) => String(file).trim())
        .filter(Boolean);

      if (!files.length) {
        throw new Error("Nessuna novità elencata nel manifest.");
      }

      const results = await Promise.allSettled(
        files.map(async (file) => {
          const response = await fetch(new URL(file, base), { cache: "no-store" });
          if (!response.ok) {
            throw new Error(`${file}: HTTP ${response.status}`);
          }

          const data = await response.json();
          return {
            data,
            date: parseDate(data.date),
            rawDate: String(data.date ?? "").trim()
          };
        })
      );

      const entries = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      if (!entries.length) {
        throw new Error("Nessuna novità caricata.");
      }

      const dated = entries.filter((entry) => entry.date);
      const pool = dated.length ? dated : entries;
      const latest = pool.sort((a, b) => {
        if (!a.date || !b.date) {
          return 0;
        }
        return b.date - a.date;
      })[0];

      render(latest);
    } catch (error) {
      card.hidden = true;
      card.setAttribute("aria-busy", "false");
      if (note) {
        note.hidden = false;
      }
      console.error("Caricamento novità non riuscito:", error);
    }
  }

  load();
})();
