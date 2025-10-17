#!/bin/bash

# Script para desplegar FlyQuest con Docker
# Este script facilita el deployment completo del proyecto

set -e

echo "🚀 Iniciando deployment de FlyQuest..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${BLUE}[FlyQuest]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

print_success "Docker y Docker Compose están instalados"

# Verificar que existe el archivo .env en el servidor
if [ ! -f "./server/.env" ]; then
    print_error "No se encontró el archivo .env en ./server/"
    echo ""
    echo "Crea un archivo ./server/.env con el siguiente contenido:"
    echo ""
    echo "PANDASCORE_API_KEY=tu_token_aqui"
    echo "ADMIN_TOKEN=tu_admin_token_aqui"
    echo ""
    exit 1
fi

print_success "Archivo .env encontrado"

# Detener contenedores existentes si los hay
print_message "Deteniendo contenedores existentes..."
docker-compose down 2>/dev/null || true

# Limpiar contenedores e imágenes antiguas (opcional)
if [ "$1" == "--clean" ]; then
    print_message "Limpiando contenedores e imágenes antiguas..."
    docker system prune -f
    docker volume prune -f
    print_success "Limpieza completada"
fi

# Construir las imágenes
print_message "Construyendo imágenes Docker..."
docker-compose build --no-cache

print_success "Imágenes construidas exitosamente"

# Iniciar los servicios
print_message "Iniciando servicios..."
docker-compose up -d

print_success "Servicios iniciados"

# Esperar a que los servicios estén listos
print_message "Esperando que los servicios estén listos..."
sleep 10

# Verificar el estado de los contenedores
print_message "Estado de los contenedores:"
docker-compose ps

# Verificar conectividad
print_message "Verificando conectividad..."

if curl -s http://localhost:4001/api/mantenimiento/estado > /dev/null; then
    print_success "Backend funcionando en http://localhost:4001"
else
    print_error "Backend no responde"
fi

if curl -s http://localhost:5173 > /dev/null; then
    print_success "Frontend funcionando en http://localhost:5173"
else
    print_error "Frontend no responde"
fi

if curl -s http://localhost:8080 > /dev/null; then
    print_success "Dashboard de Mantenimiento funcionando en http://localhost:8080"
else
    print_error "Dashboard de Mantenimiento no responde"
fi

echo ""
echo "================================================"
echo "  🎮 FlyQuest Dashboard - Deployment Completado"
echo "================================================"
echo ""
echo "📊 Servicios disponibles:"
echo ""
echo "  Frontend:        http://localhost:5173"
echo "  Backend API:     http://localhost:4001"
echo "  Mantenimiento:   http://localhost:8080"
echo ""
echo "📝 Comandos útiles:"
echo ""
echo "  Ver logs:        docker-compose logs -f [servicio]"
echo "  Detener:         docker-compose down"
echo "  Reiniciar:       docker-compose restart"
echo "  Ver estado:      docker-compose ps"
echo ""
echo "================================================"
