# DBD Builds — Guida all'utilizzo

Archivio fan-made per condividere build di **Dead by Daylight**.

---

## Avvio rapido

Il sito richiede un web server locale per funzionare (le chiamate `fetch()` non
funzionano con il protocollo `file://`). Opzioni consigliate:

```bash
# Python (disponibile di default su macOS/Linux)
python3 -m http.server 8080

# Node.js con npx
npx serve .

# VS Code: estensione "Live Server"
```

Apri poi `http://localhost:8080` nel browser.

---

## Struttura del progetto

```
dbd-builds/
├── index.html          ← Landing page principale
├── shared.css          ← Design system condiviso
│
├── survivor/
│   ├── index.html      ← Lista build Survivor
│   ├── index.css       ← Stili sezione Survivor
│   ├── display/
│   │   └── index.html  ← Pagina singola build
│   └── JSON/
│       ├── manifest.json   ← Elenco dei file build
│       ├── loop-god.json
│       └── ...
│
└── killer/
    ├── index.html      ← Lista build Killer
    ├── index.css       ← Stili sezione Killer
    ├── display/
    │   └── index.html  ← Pagina singola build
    └── JSON/
        ├── manifest.json   ← Elenco dei file build
        ├── bear-trap-master.json
        └── ...
```

---

## Aggiungere una nuova build

### 1. Crea il file JSON

Aggiungi un nuovo file `.json` nella cartella corrispondente:
- Build Survivor → `survivor/JSON/nomebuild.json`
- Build Killer   → `killer/JSON/nomebuild.json`

### 2. Registra la build nel manifest

Apri `manifest.json` nella stessa cartella e aggiungi il nome del file:

```json
["loop-god.json", "full-altruist.json", "la-mia-nuova-build.json"]
```

Questo è l'unico file di codice/configurazione da modificare.

---

## Schema JSON — Survivor

```json
{
  "name":        "Nome della Build",
  "description": "Descrizione breve della build e della sua strategia.",
  "author":      "NomeAutore",

  "item": {
    "name_en": "Flashlight",
    "name_it": "Torcia",
    "rarity":  "common",
    "image":   "https://url-immagine.com/torcia.png"
  },

  "addons": [
    {
      "name_en": "Halogen 1-1-2",
      "name_it": "Alogeno 1-1-2",
      "rarity":  "uncommon",
      "image":   "https://url-immagine.com/addon1.png"
    },
    {
      "name_en": "Leather Wrist Strap",
      "name_it": "Cinturino in Pelle",
      "rarity":  "common",
      "image":   "https://url-immagine.com/addon2.png"
    }
  ],

  "perks": [
    {
      "name_en": "Dead Hard",
      "name_it": "Duro a Morire",
      "rarity":  "very rare",
      "image":   "https://url-immagine.com/dead-hard.png"
    }
    // ... fino a 4 perk
  ]
}
```

---

## Schema JSON — Killer

```json
{
  "killer_en": "The Trapper",
  "killer_it": "Il Cacciatore",
  "name":        "Nome della Build",
  "description": "Descrizione breve della build.",
  "author":      "NomeAutore",

  "addons": [
    {
      "name_en": "Iridescent Stone",
      "name_it": "Pietra Iridata",
      "rarity":  "ultra rare",
      "image":   "https://url-immagine.com/addon1.png"
    },
    {
      "name_en": "Bloody Coil",
      "name_it": "Bobina Insanguinata",
      "rarity":  "very rare",
      "image":   "https://url-immagine.com/addon2.png"
    }
  ],

  "perks": [
    {
      "name_en": "Corrupt Intervention",
      "name_it": "Intervento Corrotto",
      "rarity":  "very rare",
      "image":   "https://url-immagine.com/perk.png"
    }
    // ... fino a 4 perk
  ]
}
```

---

## Valori di rarità validi

| Valore JSON   | Colore bordo  |
|---------------|---------------|
| `common`      | Grigio        |
| `uncommon`    | Giallo/Verde  |
| `rare`        | Verde         |
| `very rare`   | Viola         |
| `ultra rare`  | Rosso/Rosa    |

Il campo `rarity` è opzionale. Se omesso, nessun bordo colorato viene applicato.

---

## URL delle pagine build

Le build vengono aperte tramite query string:

```
/survivor/display/?build=loop-god.json
/killer/display/?build=bear-trap-master.json
```

---

## Immagini consigliate

Usa le icone della Dead by Daylight Fandom Wiki:
`https://deadbydaylight.fandom.com/wiki/`

Le immagini dei perk si trovano normalmente a URL nel formato:
`https://static.wikia.nocookie.net/deadbydaylight_gamepedia/images/[hash]/[file].png`

---

*Fan site non ufficiale — Dead by Daylight è un marchio registrato di Behaviour Interactive*
