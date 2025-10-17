#!/bin/bash
# Script para monitorizar la API de PandaScore y mostrar si FlyQuest está disponible
# Ejecuta cada minuto y guarda el resultado en logs/monitor_flyquest.log

LOG="../server/logs/monitor_flyquest.log"

# Leer token desde .env de forma segura
if [ -f "../server/.env" ]; then
    TOKEN="$(grep PANDASCORE_API_KEY ../server/.env | cut -d'=' -f2 | tr -d ' ')"
else
    echo "Error: No se encontró el archivo .env"
    exit 1
fi

if [ -z "$TOKEN" ]; then
    echo "Error: PANDASCORE_API_KEY no configurado en .env"
    exit 1
fi

URL="https://api.pandascore.io/lol/teams?search=flyquest"

while true; do
    FECHA=$(date '+%Y-%m-%d %H:%M:%S')
    RESP=$(curl -s -H "Authorization: Bearer $TOKEN" "$URL")
    if echo "$RESP" | grep -qi 'flyquest'; then
        echo "$FECHA - FlyQuest encontrado en PandaScore" | tee -a "$LOG"
    elif echo "$RESP" | grep -qi 'error'; then
        echo "$FECHA - Error de servidor en PandaScore" | tee -a "$LOG"
    else
        echo "$FECHA - FlyQuest NO encontrado" | tee -a "$LOG"
    fi
    sleep 60
    # Puedes cambiar el tiempo de espera si lo necesitas
    # sleep 300 # para cada 5 minutos
    # sleep 600 # para cada 10 minutos
    # ...
done
