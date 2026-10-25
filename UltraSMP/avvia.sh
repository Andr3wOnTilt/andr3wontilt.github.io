#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
PORT="${1:-8080}"
URL="http://localhost:${PORT}/"

if command -v python3 >/dev/null 2>&1; then
  SERVER=(python3 -m http.server "$PORT" --bind 127.0.0.1)
elif command -v python >/dev/null 2>&1; then
  SERVER=(python -m http.server "$PORT" --bind 127.0.0.1)
else
  echo "Python non trovato. Avvia un server statico nella cartella del progetto con un altro strumento."
  exit 1
fi

printf 'UltraSMP sito in esecuzione su %s\n' "$URL"
printf 'Premi Ctrl+C per fermare il server.\n'

(
  sleep 1
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 || true
  fi
) &

exec "${SERVER[@]}"
