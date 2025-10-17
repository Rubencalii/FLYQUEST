#!/bin/bash

# Script para desarrollo local (sin Docker)
# Útil para desarrollo rápido con hot-reload

echo "🔧 Iniciando modo desarrollo..."
echo "=================================="

# Función para limpiar procesos previos
cleanup() {
    echo "🧹 Limpiando procesos previos..."
    pkill -f "node.*server" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    docker-compose down 2>/dev/null || true
    sleep 2
}

# Función para verificar e instalar dependencias
install_deps() {
    echo "📦 Verificando dependencias..."
    
    if [ ! -d "server/node_modules" ]; then
        echo "Instalando dependencias del servidor..."
        cd server && npm install && cd ..
    fi
    
    if [ ! -d "frontend/node_modules" ]; then
        echo "Instalando dependencias del frontend..."
        cd frontend && npm install && cd ..
    fi
    
    echo "✅ Dependencias listas"
}

# Función para iniciar el servidor
start_server() {
    echo "🚀 Iniciando servidor backend en puerto 4001..."
    cd server
    node index.js &
    SERVER_PID=$!
    cd ..
    echo "Backend PID: $SERVER_PID"
}

# Función para iniciar el frontend
start_frontend() {
    echo "🎨 Iniciando frontend en puerto 3001..."
    sleep 2
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    echo "Frontend PID: $FRONTEND_PID"
}

# Función para verificar servicios
health_check() {
    echo "⏳ Esperando a que los servicios estén listos..."
    sleep 5
    
    echo "🏥 Verificando estado..."
    
    # Verificar backend
    if curl -s http://localhost:4001/api/flyquest/matches > /dev/null 2>&1; then
        echo "✅ Backend funcionando en http://localhost:4001"
    else
        echo "⚠️  Backend no responde aún (esto es normal, puede tardar unos segundos)"
    fi
    
    # Verificar frontend
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ Frontend funcionando en http://localhost:3001"
    else
        echo "⚠️  Frontend no responde aún (esto es normal, puede tardar unos segundos)"
    fi
}

# Función de limpieza al salir
trap_exit() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    pkill -f "node.*server" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    echo "✅ Servicios detenidos"
    exit 0
}

# Configurar trap para Ctrl+C
trap trap_exit INT TERM

# Función principal
main() {
    cleanup
    install_deps
    start_server
    start_frontend
    health_check
    
    echo ""
    echo "✅ Modo desarrollo activo!"
    echo "=================================="
    echo "🌐 Frontend: http://localhost:3001"
    echo "🔧 Backend API: http://localhost:4001"
    echo ""
    echo "Presiona Ctrl+C para detener todos los servicios"
    echo ""
    
    # Mantener el script vivo
    wait
}

# Ejecutar
main
