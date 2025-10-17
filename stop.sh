#!/bin/bash

# Script para detener FlyQuest Dashboard

echo "🛑 Deteniendo FlyQuest Dashboard..."

# Detener contenedores Docker
docker-compose down

# Limpiar procesos sueltos
pkill -f "node.*server" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

echo "✅ Servicios detenidos"
