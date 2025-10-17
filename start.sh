#!/bin/bash

# Script de inicio automatizado para FlyQuest Dashboard
# Fecha: 17 de octubre de 2025

echo "🚀 Iniciando FlyQuest Dashboard..."
echo "=================================="

# Función para limpiar procesos previos
cleanup() {
    echo "🧹 Limpiando procesos previos..."
    docker-compose down 2>/dev/null || true
    pkill -f "node.*server" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    sleep 2
}

# Función para verificar dependencias
check_dependencies() {
    echo "🔍 Verificando dependencias..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker no está instalado"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose no está instalado"
        exit 1
    fi
    
    echo "✅ Dependencias verificadas"
}

# Función para construir y levantar contenedores
start_docker() {
    echo "🐳 Construyendo contenedores Docker..."
    docker-compose build --no-cache
    
    echo "🚀 Levantando contenedores..."
    docker-compose up -d
    
    echo "⏳ Esperando a que los servicios estén listos..."
    sleep 5
}

# Función para verificar que todo está funcionando
health_check() {
    echo "🏥 Verificando estado de los servicios..."
    
    # Verificar servidor backend
    echo -n "Backend (puerto 4001): "
    if curl -s http://localhost:4001/api/flyquest/matches > /dev/null 2>&1; then
        echo "✅ Funcionando"
    else
        echo "❌ Error"
        return 1
    fi
    
    # Verificar frontend
    echo -n "Frontend (puerto 3001): "
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ Funcionando"
    else
        echo "❌ Error"
        return 1
    fi
    
    return 0
}

# Función para mostrar logs
show_status() {
    echo ""
    echo "📊 Estado de los contenedores:"
    docker-compose ps
    echo ""
    echo "📝 Últimos logs:"
    docker-compose logs --tail=20
}

# Función principal
main() {
    cleanup
    check_dependencies
    start_docker
    
    if health_check; then
        echo ""
        echo "✅ ¡FlyQuest Dashboard está funcionando!"
        echo "=================================="
        echo "🌐 Frontend: http://localhost:3001"
        echo "🔧 Backend API: http://localhost:4001"
        echo ""
        echo "📋 Comandos útiles:"
        echo "  - Ver logs: docker-compose logs -f"
        echo "  - Detener: docker-compose down"
        echo "  - Reiniciar: docker-compose restart"
        echo ""
        show_status
    else
        echo ""
        echo "⚠️  Algunos servicios no están respondiendo"
        echo "Revisa los logs con: docker-compose logs"
        show_status
        exit 1
    fi
}

# Ejecutar script principal
main
