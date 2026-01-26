fetch("readme.json")
    .then(r => r.json())
    .then(c => {
        document.getElementById("character").innerHTML = `
            <div class="character-header">
                <img src="${c.immagine}" alt="${c.nome}">
                <div class="character-names">
                    <h1>${c.nome}</h1>
                    <span>Nome umano: ${c.nome_umano}</span>
                </div>
            </div>

            <div class="section">
                <h2>Abilità Speciali</h2>
                <ul>
                    ${Object.entries(c.abilità_speciali)
                        .map(([k,v]) => `<li><b>${k}</b> — ${v}</li>`)
                        .join("")}
                </ul>
            </div>

            <div class="section">
                <h2>Gradi</h2>
                <ul>
                    ${Object.entries(c.gradi)
                        .map(([lvl,name]) => `<li>Livello ${lvl}: ${name}</li>`)
                        .join("")}
                </ul>
            </div>

            <div class="section">
                <h2>Statistiche & Attacchi</h2>
                <ul>
                    ${Object.entries(c.attacchi_base_e_stats)
                        .map(([k,v]) =>
                            `<li class="stat"><span>${k}</span><b>${v}</b></li>`
                        ).join("")}
                </ul>
            </div>
        `;
    });
