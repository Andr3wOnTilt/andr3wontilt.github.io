let characterData = null;

fetch("readme.json")
    .then(r => r.json())
    .then(data => {
        characterData = data;
        render(data);
    });

function render(c) {
    /* IDENTITÀ */
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

    /* STATISTICHE PRINCIPALI */
    document.getElementById("main-stats").innerHTML = `
        <h2>Statistiche Primarie</h2>
        ${Object.entries(c.attacchi_base_e_stats)
            .filter(([k, v]) => typeof v === "number")
            .map(([k, v]) => `
                <div class="stat"><span>${k}</span><b>${v}</b></div>
            `).join("")}
    `;

    /* ATTACCHI BASE */
    const baseAttacks = Object.values(c.attacchi_base_e_stats)
        .filter(v => typeof v === "object" && v.name)
        .map(a => `
            <div class="row">
                <b>${a.name}</b>
                <span>${a.damage !== null ? "DMG: " + a.damage : ""}</span>
                <small>
                    ${a.energy_cost !== null ? `Costo: ${a.energy_cost}` : ""}
                    ${a.protection_percent !== null ? ` | Prot: ${a.protection_percent}%` : ""}
                    ${a.damage_per_energy !== null ? ` | DPE: ${a.damage_per_energy}` : ""}
                </small>
            </div>
        `).join("");

    document.getElementById("base-attacks").innerHTML = `
        <h2>Attacchi Base</h2>
        <div class="table">${baseAttacks}</div>
    `;

    /* ABILITÀ SPECIALI */
    const abilities = Object.entries(c.abilità_speciali)
        .map(([name, a]) => `
            <div class="row">
                <b>${name}</b>
                <div><small>${a.desctiption || ""}</small></div>
                <span>${a.damage !== null ? "DMG: " + a.damage : ""}</span>
                <small>${a.energy_cost !== null ? `Costo: ${a.energy_cost}` : ""}</small>
            </div>
        `).join("");

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
