// Definizione dei personaggi
const characters = [
    {
        name: "Sorcerer Of Shadows",
        img: "images/unknown.png",
        link: "myentities/sorcererofshadows/"
    },
    {
        name: "Enchanter",
        img: "images/unknown.png",
        link: "myentities/enchanter/"
    },
    {
        name: "Sovereign of the Forgotten Order",
        img: "images/unknown.png",
        link: "myentities/sovereignoftheforgottenorder/"
    }
    // Aggiungi qui nuovi personaggi
];

// Generazione dinamica delle schede
const grid = document.getElementById('characters-grid');

characters.forEach(character => {
    const card = document.createElement('a');
    card.href = character.link;
    card.className = 'card';
    card.innerHTML = `
        <div class="card-image">
            <img src="${character.img}" alt="${character.name}">
        </div>
        <div class="card-content">
            <h3>${character.name}</h3>
        </div>
    `;
    grid.appendChild(card);
});
