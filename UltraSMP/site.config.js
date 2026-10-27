window.ULTRASMP_SITE = {
  wikiUrl: "https://wiki.ultrasmp.org/",
  packs: {
    texture: {
      name: "UltraSMP Texture Pack",
      version: "v1.0.0",
      releaseLabel: "Disponibile",
      minecraft: "1.21.x",
      format: "Resource Pack",
      file: "UltraSMP-Texture-Pack.zip",
      size: "—",
      downloadUrl: "../../downloadable/UltraSMP-Texture-Pack.zip",
      downloadLabel: "Scarica il Texture Pack"
    },
    mod: {
      name: "UltraSMP Mod Pack",
      releaseLabel: "Disponibile",
      minecraft: "26.3",
      format: "Import CurseForge / .jar",
      loader: "Fabric",
      defaultVariant: "base",
      variants: {
        base: {
          label: "Base",
          importFile: "UltraSMP-Import.zip",
          modsFile: "UltraSMP-Mods.zip"
        },
        plus: {
          label: "Plus",
          importFile: "UltraSMP-Plus-Import.zip",
          modsFile: "UltraSMP-Plus-Mods.zip"
        }
      }
    }
  }
};
