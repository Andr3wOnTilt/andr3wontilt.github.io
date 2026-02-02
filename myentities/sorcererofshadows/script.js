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
   UTILS
========================= */
function calcDamagePerEnergy(damage, energy) {
    if (damage === null || energy === null || energy === 0) return null;
    return Math.round((damage / energy) * 100) / 100;
}

/* =========================
   RENDER
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

            const dpe = calcDamagePerEnergy(a.damage, a.energy_cost);
            if (dpe !== null)
                extras.push(`DMG/Energia: ${dpe}`);

            return `
                <div class="stat-row">
                    <span><strong>${a.name}</strong></span>
                    <span style="text-align:right">
                        <b>${a.damage}</b>
                        ${extras.length ? `<br><small>${extras.join("<br>")}</small>` : ""}
                    </span>
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

            const dpe = calcDamagePerEnergy(data.damage, data.energy_cost);
            if (dpe !== null)
                extras.push(`DMG/Energia: ${dpe}`);

            const dmg = data.damage !== null ? data.damage : "—";

            return `
                <div class="stat-row">
                    <span>
                        <strong>${name}</strong><br>
                        <small>${data.desctiption}</small>
                    </span>
                    <span style="text-align:right">
                        <b>${dmg}</b>
                        ${extras.length ? `<br><small>${extras.join("<br>")}</small>` : ""}
                    </span>
                </div>
            `;
        })
        .join("");

    /* =========================
       OUTPUT
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
