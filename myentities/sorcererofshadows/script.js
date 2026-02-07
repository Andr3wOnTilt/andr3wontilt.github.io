let characterData = null;

/* ===============================
   CARICAMENTO JSON
================================ */
fetch("readme.json")
    .then(res => res.json())
    .then(data => {
        characterData = data;
        renderCharacter(data);
    })
    .catch(err => {
        console.error("Errore caricamento JSON:", err);
    });

/* ===============================
   RENDER PRINCIPALE
================================ */
function renderCharacter(c) {
    renderIdentity(c);
    renderMainStats(c);
    renderCombatStats(c);
    renderBaseAttacks(c);
    renderSpecialAbilities(c);
}

/* ===============================
   IDENTITÀ
================================ */
function renderIdentity(c) {
    document.getElementById("identity").innerHTML = `
        <h2>Identità</h2>
        <div class="identity-box">
            <img src="${c.immagine}" alt="${c.nome}">
            <div class="identity-data">
                <div class="stat"><span>Nome</span><b>${c.nome}</b></div>
                <div class="stat"><span>Identità Umana</span><b>${c.nome_umano}</b></div>
            </div>
        </div>
    `;
}

/* ===============================
   STATISTICHE PRIMARIE
================================ */
function renderMainStats(c) {
    const stats = Object.entries(c.attacchi_base_e_stats)
        .filter(([_, v]) => typeof v === "number")
        .map(([k, v]) => `
            <div class="stat">
                <span>${k}</span>
                <b>${v}</b>
            </div>
        `).join("");

    document.getElementById("main-stats").innerHTML = `
        <h2>Statistiche Primarie</h2>
        ${stats}
    `;
}

/* ===============================
   PROGRESSIONE GRADI
================================ */
function renderCombatStats(c) {
    const stats = Object.entries(c.gradi)
        .map(([k, v]) => `
            <div class="stat">
                <span>Grado ${k}</span>
                <b>${v}</b>
            </div>
        `).join("");

    document.getElementById("combat-stats").innerHTML = `
        <h2>Progressione Gradi</h2>
        ${stats}
    `;
}

/* ===============================
   ATTACCHI BASE
================================ */
function renderBaseAttacks(c) {
    const rows = Object.values(c.attacchi_base_e_stats)
        .filter(v => typeof v === "object" && v.name)
        .map(a => buildAttackRow(a))
        .join("");

    document.getElementById("base-attacks").innerHTML = `
        <h2>Attacchi Base</h2>
        <div class="table">${rows}</div>
    `;
}

/* ===============================
   ABILITÀ SPECIALI
================================ */
function renderSpecialAbilities(c) {
    const rows = Object.entries(c.abilità_speciali)
        .map(([name, a]) => buildAbilityRow(name, a))
        .join("");

    document.getElementById("special-abilities").innerHTML = `
        <h2>Abilità Speciali</h2>
        <div class="table">${rows}</div>
    `;
}

/* ===============================
   COSTRUTTORI ROW
================================ */
function buildAttackRow(a) {
    return `
        <div class="row">
            <b>${a.name}</b>
            ${buildStatsLines(a)}
        </div>
    `;
}

function buildAbilityRow(name, a) {
    return `
        <div class="row">
            <b>${name}</b>
            ${a.description ? `<div class="description">${a.description}</div>` : ""}
            ${buildStatsLines(a)}
        </div>
    `;
}

/* ===============================
   LINEE STATISTICHE COLORATE
================================ */
function buildStatsLines(a) {
    let html = "";

    if (a.damage !== null)
        html += `<div class="detail stat-dmg">DMG: ${a.damage}</div>`;

    if (a.energy_cost !== null)
        html += `<div class="detail stat-energy">Energy: ${a.energy_cost}</div>`;

    if (a.protection_percent !== null)
        html += `<div class="detail stat-protection">DEF: ${a.protection_percent}%</div>`;

    if (a.damage_per_energy !== null)
        html += `<div class="detail stat-dpe">DPE: ${a.damage_per_energy}</div>`;

    return html;
}
