#!/bin/bash

# Script de build y deploy de Docker optimizado para FlyQuest v2.0
# Incluye: Achievements, AdvancedAlerts, PlayerStats, Chart.js

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 FlyQuest Dashboard - Docker Build v2.0${NC}"
echo -e "${BLUE}===========================================${NC}\n"

# Verificar Docker instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Error: Docker no está instalado${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Error: Docker Compose no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker y Docker Compose detectados${NC}\n"

# Verificar archivos necesarios
echo -e "${BLUE}📋 Verificando archivos...${NC}"

required_files=(
    "Dockerfile"
    "docker-compose.yml"
    ".dockerignore"
    "server/index.js"
    "server/package.json"
    "frontend/package.json"
    "frontend/src/components/Achievements.jsx"
    "frontend/src/components/AdvancedAlerts.jsx"
    "frontend/src/components/PlayerStats.jsx"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✓ $file${NC}"
    else
        echo -e "${RED}  ✗ $file (no encontrado)${NC}"
        exit 1
    fi
done

echo ""

# Opción de build
echo -e "${YELLOW}Opciones de build:${NC}"
echo "1) Build rápido (usa cache)"
echo "2) Build completo (sin cache, recomendado para producción)"
echo "3) Build y ejecutar"
echo "4) Solo ejecutar (sin rebuild)"
echo "5) Detener contenedores"
echo "6) Limpiar todo (contenedores, imágenes, volúmenes)"
echo ""
read -p "Selecciona una opción (1-6): " option

case $option in
    1)
        echo -e "\n${BLUE}🔨 Build rápido con cache...${NC}"
        docker-compose build
        echo -e "${GREEN}✅ Build completado${NC}"
        ;;
    2)
        echo -e "\n${BLUE}🔨 Build completo sin cache...${NC}"
        docker-compose build --no-cache --pull
        echo -e "${GREEN}✅ Build completado${NC}"
        ;;
    3)
        echo -e "\n${BLUE}🔨 Build completo...${NC}"
        docker-compose build --no-cache --pull
        echo -e "${GREEN}✅ Build completado${NC}"
        
        echo -e "\n${BLUE}🚀 Iniciando contenedores...${NC}"
        docker-compose up -d
        
        echo -e "\n${YELLOW}⏳ Esperando que los servicios estén listos...${NC}"
        sleep 5
        
        echo -e "\n${BLUE}📊 Estado de contenedores:${NC}"
        docker-compose ps
        
        echo -e "\n${BLUE}🔍 Health check:${NC}"
        docker inspect --format='{{.State.Health.Status}}' flyquest-app 2>/dev/null || echo "Esperando healthcheck..."
        
        echo -e "\n${GREEN}✅ Aplicación iniciada${NC}"
        echo -e "${BLUE}🌐 Accede a: ${GREEN}http://localhost:4001${NC}"
        echo -e "${BLUE}🔧 Mantenimiento: ${GREEN}http://localhost:4001/mantenimiento${NC}"
        
        echo -e "\n${YELLOW}Ver logs en tiempo real:${NC}"
        echo -e "${BLUE}docker-compose logs -f app${NC}\n"
        ;;
    4)
        echo -e "\n${BLUE}🚀 Iniciando contenedores...${NC}"
        docker-compose up -d
        
        echo -e "\n${YELLOW}⏳ Esperando que los servicios estén listos...${NC}"
        sleep 5
        
        echo -e "\n${BLUE}📊 Estado de contenedores:${NC}"
        docker-compose ps
        
        echo -e "\n${GREEN}✅ Contenedores iniciados${NC}"
        echo -e "${BLUE}🌐 Accede a: ${GREEN}http://localhost:4001${NC}"
        ;;
    5)
        echo -e "\n${YELLOW}🛑 Deteniendo contenedores...${NC}"
        docker-compose down
        echo -e "${GREEN}✅ Contenedores detenidos${NC}"
        ;;
    6)
        echo -e "\n${RED}⚠️  ADVERTENCIA: Esto eliminará todos los contenedores, imágenes y volúmenes${NC}"
        read -p "¿Estás seguro? (y/N): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            echo -e "\n${YELLOW}🧹 Limpiando...${NC}"
            docker-compose down -v
            docker system prune -a -f
            echo -e "${GREEN}✅ Limpieza completada${NC}"
        else
            echo -e "${BLUE}Operación cancelada${NC}"
        fi
        ;;
    *)
        echo -e "${RED}Opción inválida${NC}"
        exit 1
        ;;
esac

# Información adicional
if [ "$option" = "1" ] || [ "$option" = "2" ] || [ "$option" = "3" ]; then
    echo -e "\n${BLUE}📦 Información de la imagen:${NC}"
    docker images | grep flyquest || echo "Imagen aún no disponible"
    
    echo -e "\n${BLUE}💡 Comandos útiles:${NC}"
    echo -e "  ${GREEN}docker-compose logs -f app${NC}     - Ver logs en tiempo real"
    echo -e "  ${GREEN}docker-compose ps${NC}              - Ver estado de contenedores"
    echo -e "  ${GREEN}docker-compose restart app${NC}     - Reiniciar servicio"
    echo -e "  ${GREEN}docker exec -it flyquest-app sh${NC} - Entrar al contenedor"
    echo -e "  ${GREEN}docker stats flyquest-app${NC}      - Ver uso de recursos\n"
fi

echo -e "${GREEN}🎉 Proceso completado!${NC}"
