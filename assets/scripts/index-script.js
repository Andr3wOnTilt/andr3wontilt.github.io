function expandPack(id) {
    const packs = document.querySelectorAll('.pack');
    packs.forEach(pack => {
        if (pack.id === id) {
            pack.classList.add('expanded');
            pack.querySelector('table').style.display = 'table';
        } else {
            pack.style.display = 'none';
        }
    });
}

function resetView() {
    const packs = document.querySelectorAll('.pack');
    packs.forEach(pack => {
        pack.style.display = 'block';
        pack.classList.remove('expanded');
        pack.querySelector('table').style.display = 'none';
    });
}