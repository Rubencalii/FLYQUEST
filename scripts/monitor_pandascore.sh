#!/bin/bash
# Script para monitorear el estado de la API de PandaScore
# IMPORTANTE: Configura tu token de PandaScore como variable de entorno
# export PANDASCORE_API_KEY="tu_token_aqui"

TOKEN="${PANDASCORE_API_KEY:-}"
if [ -z "$TOKEN" ]; then
    echo "Error: Variable PANDASCORE_API_KEY no configurada"
    echo "Usa: export PANDASCORE_API_KEY='tu_token_aqui'"
    exit 1
fi

TEAM="flyquest"
LOG="monitor_pandascore.log"
URL="https://api.pandascore.io/lol/teams?search=$TEAM"

while true; do
    TS=$(date '+%Y-%m-%d %H:%M:%S')
    RES=$(curl -s -H "Authorization: Bearer $TOKEN" "$URL")
    if echo "$RES" | grep -q 'errorCode'; then
        echo "$TS - API caída o error: $(echo $RES | head -c 80)" | tee -a "$LOG"
    else
        echo "$TS - API OK: $(echo $RES | head -c 80)" | tee -a "$LOG"
        notify-send "PandaScore API disponible" "$TS"
        break
    fi
    sleep 60
    # Puedes cambiar el tiempo de espera si lo deseas
    
    # Limitar tamaño del log
    tail -n 200 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
done
