const entities = [
    {
        name: "Sorcerer Of Shadows",
        img: "images/unknown.png",
        link: "/myentities/sorcererofshadows/"
    },
    {
        name: "Enchanter",
        img: "images/unknown.png",
        link: "/myentities/enchanter/"
    },
    {
        name: "Sovereign of the Forgotten Order",
        img: "images/unknown.png",
        link: "/myentities/sovereignoftheforgottenorder/"
    }
    // Basta aggiungere qui nuove entità
];

const grid = document.getElementById('entities-grid');

entities.forEach(e => {
    const card = document.createElement('a');
    card.href = e.link;
    card.className = 'card';
    card.innerHTML = `
        <img src="${e.img}" alt="${e.name}">
        <div class="card-content">
            <h3>${e.name}</h3>
        </div>
    `;
    grid.appendChild(card);
});
