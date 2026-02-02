let characterData = null;

fetch("readme.json")
    .then(r => r.json())
    .then(data => {
        characterData = data;
        render(data);
    });

function render(c) {

    document.getElementById("identity").innerHTML = `
        <h2>Identità</h2>

        <div class="identity-box">
            <img src="${c.immagine}" alt="${c.nome}">

            <div class="identity-data">
                <div class="stat">
                    <span>Nome</span>
                    <b>${c.nome}</b>
                </div>

                <div class="stat">
                    <span>Identità umana</span>
                    <b>${c.nome_umano}</b>
                </div>
            </div>
        </div>
    `;

    /* STATISTICHE PRINCIPALI */
    document.getElementById("main-stats").innerHTML = `
        <h2>Statistiche Primarie</h2>
        <div class="stat"><span>Vita</span><b>${c.attacchi_base_e_stats.Vita}</b></div>
        <div class="stat"><span>Energie Max</span><b>${c.attacchi_base_e_stats.EnergyMax}</b></div>
        <div class="stat">
            <span>Livello Invisibilità</span>
            <b>${c.attacchi_base_e_stats["Livello di Invisibilità"]}</b>
        </div>
    `;

    /* ATTACCHI BASE */
    const baseAttacks = Object.values(c.attacchi_base_e_stats)
        .filter(v => typeof v === "object" && v.name)
        .map(a => `
            <div class="row">
                <b>${a.name}</b>
                <span>DMG: ${a.damage}</span>
                <small>
                    ${a.energy_cost ? `Costo: ${a.energy_cost}` : ""}
                    ${a.protection_percent ? ` | Prot: ${a.protection_percent}%` : ""}
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
                <span>DMG: ${a.damage ?? "—"}</span>
                <small>
                    ${a.desctiption}<br>
                    ${a.energy_cost ? `Costo: ${a.energy_cost}` : ""}
                </small>
            </div>
        `).join("");

    document.getElementById("special-abilities").innerHTML = `
        <h2>Abilità Speciali</h2>
        <div class="table">${abilities}</div>
    `;
}

/* DOWNLOAD */
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
