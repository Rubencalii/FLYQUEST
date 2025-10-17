#!/bin/bash

# Script para verificar el estado completo del sistema

echo "🔍 Verificación del Sistema FlyQuest"
echo "====================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar un servicio
check_service() {
    local service_name=$1
    local url=$2
    
    echo -n "Verificando $service_name... "
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ ERROR${NC}"
        return 1
    fi
}

# Verificar Docker
echo "🐳 Estado de Docker:"
if docker-compose ps | grep -q "Up"; then
    docker-compose ps
else
    echo -e "${YELLOW}⚠️  No hay contenedores corriendo${NC}"
fi
echo ""

# Verificar puertos
echo "🔌 Puertos en uso:"
echo -n "Puerto 4001 (Backend): "
if lsof -i:4001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Activo${NC}"
else
    echo -e "${RED}❌ Libre${NC}"
fi

echo -n "Puerto 3001 (Frontend): "
if lsof -i:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Activo${NC}"
else
    echo -e "${RED}❌ Libre${NC}"
fi
echo ""

# Verificar servicios
echo "🌐 Estado de Servicios:"
check_service "Backend API" "http://localhost:4001/api/flyquest/matches"
check_service "Frontend" "http://localhost:3001"
echo ""

# Verificar archivos importantes
echo "📁 Archivos del Proyecto:"
files=("docker-compose.yml" "frontend/package.json" "server/package.json" "frontend/Dockerfile" "server/Dockerfile")
for file in "${files[@]}"; do
    echo -n "$file: "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌ No encontrado${NC}"
    fi
done
echo ""

# Verificar datos
echo "📊 Datos de la API:"
echo "Primeros 200 caracteres de la respuesta:"
curl -s http://localhost:4001/api/flyquest/matches 2>/dev/null | head -c 200 || echo -e "${YELLOW}No se pudo obtener datos${NC}"
echo ""
echo ""

# Resumen
echo "=================================="
echo "Verificación completa"
echo "Ejecuta './start.sh' para iniciar el sistema"
echo "Ejecuta './dev.sh' para modo desarrollo"
