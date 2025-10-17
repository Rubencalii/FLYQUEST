# Script de build y deploy de Docker optimizado para FlyQuest v2.0
# PowerShell version para Windows
# Incluye: Achievements, AdvancedAlerts, PlayerStats, Chart.js

$ErrorActionPreference = "Stop"

Write-Host "🐳 FlyQuest Dashboard - Docker Build v2.0" -ForegroundColor Blue
Write-Host "===========================================" -ForegroundColor Blue
Write-Host ""

# Verificar Docker instalado
try {
    docker --version | Out-Null
    Write-Host "✅ Docker detectado" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: Docker no está instalado o no está en PATH" -ForegroundColor Red
    exit 1
}

try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose detectado" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: Docker Compose no está instalado" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verificar archivos necesarios
Write-Host "📋 Verificando archivos..." -ForegroundColor Blue

$requiredFiles = @(
    "Dockerfile",
    "docker-compose.yml",
    ".dockerignore",
    "server\index.js",
    "server\package.json",
    "frontend\package.json",
    "frontend\src\components\Achievements.jsx",
    "frontend\src\components\AdvancedAlerts.jsx",
    "frontend\src\components\PlayerStats.jsx"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    }
    else {
        Write-Host "  ✗ $file (no encontrado)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Opciones de build
Write-Host "Opciones de build:" -ForegroundColor Yellow
Write-Host "1) Build rápido (usa cache)"
Write-Host "2) Build completo (sin cache, recomendado para producción)"
Write-Host "3) Build y ejecutar"
Write-Host "4) Solo ejecutar (sin rebuild)"
Write-Host "5) Detener contenedores"
Write-Host "6) Limpiar todo (contenedores, imágenes, volúmenes)"
Write-Host ""
$option = Read-Host "Selecciona una opción (1-6)"

switch ($option) {
    "1" {
        Write-Host "`n🔨 Build rápido con cache..." -ForegroundColor Blue
        docker-compose build
        Write-Host "✅ Build completado" -ForegroundColor Green
    }
    "2" {
        Write-Host "`n🔨 Build completo sin cache..." -ForegroundColor Blue
        docker-compose build --no-cache --pull
        Write-Host "✅ Build completado" -ForegroundColor Green
    }
    "3" {
        Write-Host "`n🔨 Build completo..." -ForegroundColor Blue
        docker-compose build --no-cache --pull
        Write-Host "✅ Build completado" -ForegroundColor Green
        
        Write-Host "`n🚀 Iniciando contenedores..." -ForegroundColor Blue
        docker-compose up -d
        
        Write-Host "`n⏳ Esperando que los servicios estén listos..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        Write-Host "`n📊 Estado de contenedores:" -ForegroundColor Blue
        docker-compose ps
        
        Write-Host "`n🔍 Health check:" -ForegroundColor Blue
        try {
            $health = docker inspect --format='{{.State.Health.Status}}' flyquest-app 2>$null
            Write-Host "Estado: $health" -ForegroundColor Green
        }
        catch {
            Write-Host "Esperando healthcheck..." -ForegroundColor Yellow
        }
        
        Write-Host "`n✅ Aplicación iniciada" -ForegroundColor Green
        Write-Host "🌐 Accede a: http://localhost:4001" -ForegroundColor Blue
        Write-Host "🔧 Mantenimiento: http://localhost:4001/mantenimiento" -ForegroundColor Blue
        
        Write-Host "`nVer logs en tiempo real:" -ForegroundColor Yellow
        Write-Host "docker-compose logs -f app" -ForegroundColor Blue
        Write-Host ""
    }
    "4" {
        Write-Host "`n🚀 Iniciando contenedores..." -ForegroundColor Blue
        docker-compose up -d
        
        Write-Host "`n⏳ Esperando que los servicios estén listos..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        Write-Host "`n📊 Estado de contenedores:" -ForegroundColor Blue
        docker-compose ps
        
        Write-Host "`n✅ Contenedores iniciados" -ForegroundColor Green
        Write-Host "🌐 Accede a: http://localhost:4001" -ForegroundColor Blue
    }
    "5" {
        Write-Host "`n🛑 Deteniendo contenedores..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "✅ Contenedores detenidos" -ForegroundColor Green
    }
    "6" {
        Write-Host "`n⚠️  ADVERTENCIA: Esto eliminará todos los contenedores, imágenes y volúmenes" -ForegroundColor Red
        $confirm = Read-Host "¿Estás seguro? (y/N)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            Write-Host "`n🧹 Limpiando..." -ForegroundColor Yellow
            docker-compose down -v
            docker system prune -a -f
            Write-Host "✅ Limpieza completada" -ForegroundColor Green
        }
        else {
            Write-Host "Operación cancelada" -ForegroundColor Blue
        }
    }
    default {
        Write-Host "Opción inválida" -ForegroundColor Red
        exit 1
    }
}

# Información adicional
if ($option -in @("1", "2", "3")) {
    Write-Host "`n📦 Información de la imagen:" -ForegroundColor Blue
    docker images | Select-String "flyquest"
    
    Write-Host "`n💡 Comandos útiles:" -ForegroundColor Blue
    Write-Host "  docker-compose logs -f app      - Ver logs en tiempo real" -ForegroundColor Green
    Write-Host "  docker-compose ps               - Ver estado de contenedores" -ForegroundColor Green
    Write-Host "  docker-compose restart app      - Reiniciar servicio" -ForegroundColor Green
    Write-Host "  docker exec -it flyquest-app sh - Entrar al contenedor" -ForegroundColor Green
    Write-Host "  docker stats flyquest-app       - Ver uso de recursos" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🎉 Proceso completado!" -ForegroundColor Green
