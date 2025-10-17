#!/bin/bash

# Script para gestionar Docker en FlyQuest
# Uso: ./docker.sh [comando]

set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}=== FlyQuest Docker Manager ===${NC}"
    echo ""
    echo "Uso: ./docker.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  build       - Construir las imágenes Docker"
    echo "  up          - Iniciar los contenedores"
    echo "  down        - Detener y eliminar los contenedores"
    echo "  restart     - Reiniciar los contenedores"
    echo "  logs        - Ver los logs de los contenedores"
    echo "  logs-app    - Ver solo los logs de la aplicación"
    echo "  status      - Ver el estado de los contenedores"
    echo "  clean       - Limpiar contenedores, imágenes y volúmenes"
    echo "  rebuild     - Reconstruir todo desde cero"
    echo "  help        - Mostrar esta ayuda"
    echo ""
}

# Función para construir las imágenes
build() {
    echo -e "${BLUE}🔨 Construyendo imágenes Docker...${NC}"
    docker-compose build --no-cache
    echo -e "${GREEN}✅ Imágenes construidas exitosamente${NC}"
}

# Función para iniciar los contenedores
up() {
    echo -e "${BLUE}🚀 Iniciando contenedores...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ Contenedores iniciados${NC}"
    echo ""
    echo -e "${YELLOW}📍 Servicios disponibles:${NC}"
    echo -e "   🌐 Aplicación principal: http://localhost:4001"
    echo -e "   🔧 Panel de mantenimiento: http://localhost:4001/mantenimiento/mantenimiento.html"
    echo ""
    echo -e "${BLUE}💡 Usa './docker.sh logs' para ver los logs${NC}"
}

# Función para detener los contenedores
down() {
    echo -e "${BLUE}🛑 Deteniendo contenedores...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Contenedores detenidos${NC}"
}

# Función para reiniciar
restart() {
    echo -e "${BLUE}🔄 Reiniciando contenedores...${NC}"
    docker-compose restart
    echo -e "${GREEN}✅ Contenedores reiniciados${NC}"
}

# Función para ver logs
logs() {
    echo -e "${BLUE}📋 Mostrando logs...${NC}"
    docker-compose logs -f --tail=100
}

# Función para ver logs de la app
logs_app() {
    echo -e "${BLUE}📋 Mostrando logs de la aplicación...${NC}"
    docker-compose logs -f --tail=100 app
}

# Función para ver estado
status() {
    echo -e "${BLUE}📊 Estado de los contenedores:${NC}"
    docker-compose ps
    echo ""
    echo -e "${BLUE}💾 Uso de volúmenes:${NC}"
    docker volume ls | grep flyquest || echo "No hay volúmenes de FlyQuest"
}

# Función para limpiar
clean() {
    echo -e "${RED}⚠️  Esta acción eliminará contenedores, imágenes y volúmenes${NC}"
    read -p "¿Estás seguro? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🧹 Limpiando...${NC}"
        docker-compose down -v
        docker system prune -a -f --volumes
        echo -e "${GREEN}✅ Limpieza completada${NC}"
    else
        echo -e "${YELLOW}❌ Operación cancelada${NC}"
    fi
}

# Función para reconstruir todo
rebuild() {
    echo -e "${BLUE}🔄 Reconstruyendo todo desde cero...${NC}"
    down
    build
    up
    echo -e "${GREEN}✅ Reconstrucción completada${NC}"
}

# Main
case "${1:-}" in
    build)
        build
        ;;
    up|start)
        up
        ;;
    down|stop)
        down
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    logs-app)
        logs_app
        ;;
    status)
        status
        ;;
    clean)
        clean
        ;;
    rebuild)
        rebuild
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Comando no reconocido: ${1:-}${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
