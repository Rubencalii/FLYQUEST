#!/bin/bash

# Script para ver logs de los servicios

echo "📋 Logs de FlyQuest Dashboard"
echo "=============================="
echo ""

# Verificar si hay contenedores corriendo
if docker-compose ps | grep -q "Up"; then
    echo "Mostrando logs de contenedores Docker..."
    docker-compose logs -f --tail=50
else
    echo "⚠️  No hay contenedores Docker corriendo"
    echo ""
    echo "¿Quieres ver logs de procesos locales? (s/n)"
    read -r response
    
    if [[ "$response" =~ ^[Ss]$ ]]; then
        echo "Buscando procesos node y vite..."
        ps aux | grep -E "(node|vite)" | grep -v grep
    fi
fi
