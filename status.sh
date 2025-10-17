#!/bin/bash

# Script de estado rápido

echo "======================================"
echo "  🎮 FlyQuest Dashboard - Estado"
echo "======================================"
echo ""

# Verificar backend
echo -n "Backend (4001): "
if lsof -i:4001 > /dev/null 2>&1; then
    echo "✅ ACTIVO"
else
    echo "❌ INACTIVO"
fi

# Verificar frontend
echo -n "Frontend (3001): "
if lsof -i:3001 > /dev/null 2>&1; then
    echo "✅ ACTIVO"
else
    echo "❌ INACTIVO"
fi

echo ""
echo "URLs:"
echo "  🌐 Frontend: http://localhost:3001"
echo "  🔧 Backend:  http://localhost:4001"
echo ""
echo "Comandos útiles:"
echo "  ./stop.sh    - Detener servicios"
echo "  ./dev.sh     - Iniciar en desarrollo"
echo "  ./check.sh   - Diagnóstico completo"
echo ""
