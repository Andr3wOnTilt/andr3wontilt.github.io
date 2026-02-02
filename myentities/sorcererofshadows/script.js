let characterData = null;

/* =========================
   LOAD JSON
========================= */
fetch("readme.json")
    .then(r => r.json())
    .then(data => {
        characterData = data;
        renderCharacter(data);
    })
    .catch(err => console.error("Errore caricamento JSON:", err));

/* =========================
   RENDER CHARACTER
========================= */
function renderCharacter(c) {

    /* =========================
       STATISTICHE BASE
    ========================= */
    const stats = `
        <div class="stat-row"><span>Vita</span><b>${c.attacchi_base_e_stats.Vita}</b></div>
        <div class="stat-row"><span>Energie</span><b>${c.attacchi_base_e_stats.EnergyMax}</b></div>
        <div class="stat-row">
            <span>Livello di Invisibilità</span>
            <b>${c.attacchi_base_e_stats["Livello di Invisibilità"]}</b>
        </div>
    `;

    /* =========================
       ATTACCHI BASE
    ========================= */
    const attacks = Object.values(c.attacchi_base_e_stats)
        .filter(v => typeof v === "object" && v.name)
        .map(a => {

            const extras = [];

            if (a.energy_cost !== null)
                extras.push(`Energie: ${a.energy_cost}`);

            if (a.protection_percent !== null)
                extras.push(`Protezione: ${a.protection_percent}%`);

            if (a.damage_per_energy !== null)
                extras.push(`DMG/Energia: ${a.damage_per_energy}`);

            return `
                <div class="stat-row">
                    <span>
                        <strong>${a.name}</strong>
                        ${extras.length ? `<br><small>${extras.join(" • ")}</small>` : ""}
                    </span>
                    <b>${a.damage}</b>
                </div>
            `;
        })
        .join("");

    /* =========================
       ABILITÀ SPECIALI
    ========================= */
    const abilities = Object.entries(c.abilità_speciali)
        .map(([name, data]) => {

            const extras = [];

            if (data.energy_cost !== null)
                extras.push(`Energie: ${data.energy_cost}`);

            if (data.protection_percent !== null)
                extras.push(`Protezione: ${data.protection_percent}%`);

            if (data.damage_per_energy !== null)
                extras.push(`DMG/Energia: ${data.damage_per_energy}`);

            const dmg = data.damage !== null ? data.damage : "—";

            return `
                <div class="stat-row">
                    <span>
                        <strong>${name}</strong><br>
                        <small>${data.desctiption}</small>
                        ${extras.length ? `<br><small>${extras.join(" • ")}</small>` : ""}
                    </span>
                    <b>${dmg}</b>
                </div>
            `;
        })
        .join("");

    /* =========================
       OUTPUT HTML
    ========================= */
    document.getElementById("character").innerHTML = `
        <div class="character-header">
            <img src="${c.immagine}" alt="${c.nome}">
            <div class="character-names">
                <h1>${c.nome}</h1>
                <span>Identità umana: ${c.nome_umano}</span>
            </div>
        </div>

        <div class="accordion">
            <div class="accordion-header" onclick="toggleAccordion(this)">
                <h3>Profilo Operativo Dettagliato</h3>
                <span>Espandi</span>
            </div>

            <div class="accordion-content">
                <div class="subsection">
                    <h4>Statistiche Principali</h4>
                    ${stats}
                </div>

                <div class="subsection">
                    <h4>Attacchi Base</h4>
                    ${attacks}
                </div>

                <div class="subsection">
                    <h4>Abilità Uniche</h4>
                    ${abilities}
                </div>
            </div>
        </div>
    `;
}

/* =========================
   ACCORDION
========================= */
function toggleAccordion(header) {
    const content = header.nextElementSibling;
    content.classList.toggle("open");

    header.querySelector("span").textContent =
        content.classList.contains("open") ? "Riduci" : "Espandi";
}

/* =========================
   DOWNLOAD JSON
========================= */
function downloadJSON() {
    if (!characterData) return;

    const blob = new Blob(
        [JSON.stringify(characterData, null, 2)],
        { type: "application/json" }
    );

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${characterData.nome}.json`;
    a.click();
}
