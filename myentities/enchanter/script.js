let characterData = null;

fetch("readme.json")
  .then(r => r.json())
  .then(c => {
    characterData = c;
    renderCharacter(c);
  });

function renderCharacter(c) {
    const stats = `
        <div class="stat-row"><span>Vita</span><b>${c.attacchi_base_e_stats.Vita}</b></div>
        <div class="stat-row"><span>Energia Massima</span><b>${c.attacchi_base_e_stats.EnergtMax}</b></div>
        <div class="stat-row"><span>Livello di Invisibilità</span><b>${c.attacchi_base_e_stats["Livello di Invisibilità"]}</b></div>
    `;

    const abilities = Object.entries(c.abilità_speciali)
        .map(([k,v]) => `<div class="stat-row"><span>${k}</span><b>${v}</b></div>`)
        .join("");

    const attacks = Object.values(c.attacchi_base_e_stats)
        .filter(v => typeof v === "object")
        .map(a => `<div class="stat-row"><span>${a.name}</span><b>${a.damage}</b></div>`)
        .join("");

    document.getElementById("character").innerHTML = `
        <div class="character-header">
            <img src="${c.immagine}">
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
                    <h4>Attacchi Base e DMG</h4>
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

function toggleAccordion(el) {
    const content = el.nextElementSibling;
    content.classList.toggle("open");
    el.querySelector("span").textContent =
        content.classList.contains("open") ? "Riduci" : "Espandi";
}

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
