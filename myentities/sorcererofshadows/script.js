let characterData = null;

fetch("readme.json")
    .then(r => r.json())
    .then(data => {
        characterData = data;
        render(data);
    });

function render(c) {
    // IDENTITÀ
    document.getElementById("identity").innerHTML = `
        <h2>Identità</h2>
        <div class="identity-box">
            <img src="${c.immagine}" alt="${c.nome}">
            <div class="identity-data">
                <div class="stat"><span>Nome</span><b>${c.nome}</b></div>
                <div class="stat"><span>Identità umana</span><b>${c.nome_umano}</b></div>
            </div>
        </div>
    `;

    // STATISTICHE PRINCIPALI
    document.getElementById("main-stats").innerHTML = `
        <h2>Statistiche Primarie</h2>
        ${Object.entries(c.attacchi_base_e_stats)
            .filter(([k, v]) => typeof v === "number")
            .map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`)
            .join("")}
    `;

    // ATTACCHI BASE
    const baseAttacks = Object.values(c.attacchi_base_e_stats)
        .filter(a => typeof a === "object" && a.name)
        .map(a => {
            let details = [];
            if (a.damage !== null) details.push(`DMG: ${a.damage}`);
            if (a.energy_cost !== null) details.push(`Costo: ${a.energy_cost}`);
            if (a.protection_percent !== null) details.push(`Prot: ${a.protection_percent}%`);
            if (a.damage_per_energy !== null) details.push(`DPE: ${a.damage_per_energy}`);
            return `
                <div class="ability-block">
                    <div class="ability-name">${a.name}</div>
                    ${details.length ? `<div class="ability-details">${details.join(" | ")}</div>` : ""}
                </div>
            `;
        }).join("");

    document.getElementById("base-attacks").innerHTML = `
        <h2>Attacchi Base</h2>
        <div class="table">${baseAttacks}</div>
    `;

    // ABILITÀ SPECIALI
    const abilities = Object.entries(c.abilità_speciali)
        .map(([name, a]) => {
            let details = [];
            if (a.damage !== null) details.push(`DMG: ${a.damage}`);
            if (a.energy_cost !== null) details.push(`Costo: ${a.energy_cost}`);
            if (a.protection_percent !== null) details.push(`Prot: ${a.protection_percent}%`);
            if (a.damage_per_energy !== null) details.push(`DPE: ${a.damage_per_energy}`);
            return `
                <div class="ability-block">
                    <div class="ability-name">${name}</div>
                    <div class="ability-description">${a.desctiption || ""}</div>
                    ${details.length ? `<div class="ability-details">${details.join(" | ")}</div>` : ""}
                </div>
            `;
        }).join("");

    document.getElementById("special-abilities").innerHTML = `
        <h2>Abilità Speciali</h2>
        <div class="table">${abilities}</div>
    `;
}

/* DOWNLOAD JSON */
function downloadJSON() {
    const blob = new Blob(
        [JSON.stringify(characterData, null, 2)],
        { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${characterData.nome}.json`;
    a.click();
}
