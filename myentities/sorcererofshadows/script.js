let characterData = null;

// CARICAMENTO JSON
fetch("readme.json")
    .then(res => res.json())
    .then(data => {
        characterData = data;
        renderCharacter(data);
    });

// FUNZIONE PRINCIPALE DI RENDER
function renderCharacter(c) {
    renderIdentity(c);
    renderMainStats(c);
    renderCombatStats(c);
    renderBaseAttacks(c);
    renderSpecialAbilities(c);
}

// --- IDENTITÀ ---
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

// --- STATISTICHE PRINCIPALI ---
function renderMainStats(c) {
    const stats = Object.entries(c.attacchi_base_e_stats)
        .filter(([k,v]) => typeof v === "number")
        .map(([k,v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join('');

    document.getElementById("main-stats").innerHTML = `
        <h2>Statistiche Primarie</h2>
        ${stats}
    `;
}

// --- STATISTICHE COMBATTIMENTO ---
function renderCombatStats(c) {
    const stats = Object.entries(c.gradi)
        .map(([k,v]) => `<div class="stat"><span>Grado ${k}</span><b>${v}</b></div>`).join('');

    document.getElementById("combat-stats").innerHTML = `
        <h2>Progressione Gradi</h2>
        ${stats}
    `;
}

// --- ATTACCHI BASE ---
function renderBaseAttacks(c) {
    const baseAttacks = Object.values(c.attacchi_base_e_stats)
        .filter(a => typeof a === "object" && a.name)
        .map(a => {
            const lines = [];
            if(a.damage!==null) lines.push(`DMG: ${a.damage}`);
            if(a.energy_cost!==null) lines.push(`Energy: ${a.energy_cost}`);
            if(a.protection_percent!==null) lines.push(`DEF: ${a.protection_percent}%`);
            if(a.damage_per_energy!==null) lines.push(`DPE: ${a.damage_per_energy}`);
            return `
                <div class="row">
                    <b>${a.name}</b>
                    ${lines.map(line => `<div class="detail">${line}</div>`).join('')}
                </div>
            `;
        }).join('');

    document.getElementById("base-attacks").innerHTML = `
        <h2>Attacchi Base</h2>
        <div class="table">${baseAttacks}</div>
    `;
}

// --- ABILITÀ SPECIALI ---
function renderSpecialAbilities(c) {
    const abilities = Object.entries(c.abilità_speciali)
        .map(([name,a]) => {
            const lines = [];
            if(a.damage!==null) lines.push(`DMG: ${a.damage}`);
            if(a.energy_cost!==null) lines.push(`Energy: ${a.energy_cost}`);
            if(a.protection_percent!==null) lines.push(`DEF: ${a.protection_percent}%`);
            if(a.damage_per_energy!==null) lines.push(`DPE: ${a.damage_per_energy}`);
            return `
                <div class="row">
                    <b>${name}</b>
                    <div class="description">${a.desctiption || ''}</div>
                    ${lines.map(line => `<div class="detail">${line}</div>`).join('')}
                </div>
            `;
        }).join('');

    document.getElementById("special-abilities").innerHTML = `
        <h2>Abilità Speciali</h2>
        <div class="table">${abilities}</div>
    `;
}