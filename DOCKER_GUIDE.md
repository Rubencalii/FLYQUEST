# 🐳 Guía de Docker - FlyQuest

Esta guía explica cómo usar Docker para ejecutar FlyQuest en un contenedor.

## 📋 Requisitos Previos

- **Docker** (versión 20.10 o superior)
- **Docker Compose** (versión 1.29 o superior)

### Instalación de Docker

- **Windows/Mac**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: Sigue las instrucciones para tu distribución en [docs.docker.com](https://docs.docker.com/engine/install/)

## 🚀 Inicio Rápido

### Opción 1: Usar el Script de Docker (Linux/Mac)

```bash
# Dar permisos de ejecución
chmod +x docker.sh

# Construir y ejecutar
./docker.sh rebuild
```

### Opción 2: Comandos Docker Compose Directos

```bash
# Construir las imágenes
docker-compose build

# Iniciar los contenedores
docker-compose up -d

# Ver los logs
docker-compose logs -f
```

## 🎯 Arquitectura Docker

### Contenedor Principal: `flyquest-app`

Un único contenedor que incluye:

- ✅ **Backend (Node.js)**: API REST en el puerto 4001
- ✅ **Frontend compilado**: Dashboard React servido por el backend
- ✅ **Scripts de mantenimiento**: Panel de administración

**Puerto expuesto**: `4001`

### Volúmenes Persistentes

- `app-data`: Almacena bugs.json y otros datos
- `app-logs`: Almacena logs de la aplicación

## 📝 Comandos Disponibles

### Con el Script `docker.sh`

```bash
./docker.sh build       # Construir las imágenes
./docker.sh up          # Iniciar contenedores
./docker.sh down        # Detener contenedores
./docker.sh restart     # Reiniciar contenedores
./docker.sh logs        # Ver logs en tiempo real
./docker.sh status      # Ver estado de contenedores
./docker.sh clean       # Limpiar todo (⚠️ incluye volúmenes)
./docker.sh rebuild     # Reconstruir desde cero
./docker.sh help        # Mostrar ayuda
```

### Con Docker Compose

```bash
# Construcción
docker-compose build                    # Construir imágenes
docker-compose build --no-cache         # Construir sin caché

# Ejecución
docker-compose up                       # Iniciar en modo attached
docker-compose up -d                    # Iniciar en modo detached (background)
docker-compose down                     # Detener y eliminar contenedores
docker-compose down -v                  # Detener y eliminar incluyendo volúmenes

# Logs y debugging
docker-compose logs                     # Ver todos los logs
docker-compose logs -f                  # Ver logs en tiempo real
docker-compose logs -f app              # Ver logs solo de la app
docker-compose logs --tail=50 app       # Ver últimas 50 líneas

# Estado
docker-compose ps                       # Ver estado de contenedores
docker-compose exec app sh              # Entrar al contenedor

# Mantenimiento
docker-compose restart                  # Reiniciar servicios
docker-compose restart app              # Reiniciar solo la app
```

## 🌐 Acceso a la Aplicación

Una vez iniciado el contenedor:

- **Dashboard Principal**: http://localhost:4001
- **Panel de Mantenimiento**: http://localhost:4001/mantenimiento/mantenimiento.html
- **API Bugs**: http://localhost:4001/api/bugs

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la carpeta `server/`:

```env
# Puerto del servidor
PORT=4001

# Entorno
NODE_ENV=production

# API Keys (si las necesitas)
LOL_ESPORTS_API_KEY=tu_api_key_aqui
```

## 🔧 Desarrollo vs Producción

### Desarrollo Local (sin Docker)

```bash
# Frontend (puerto 3001)
cd frontend
npm install
npm run dev

# Backend (puerto 4001)
cd server
npm install
npm run dev
```

### Producción con Docker

```bash
# Construir y ejecutar
docker-compose up -d

# La aplicación completa estará en http://localhost:4001
```

## 🐛 Troubleshooting

### El contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs app

# Verificar que el puerto 4001 no esté en uso
netstat -ano | findstr :4001  # Windows
lsof -i :4001                 # Linux/Mac

# Reconstruir desde cero
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Cambios en el código no se reflejan

```bash
# Docker necesita reconstruir la imagen
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Problemas con volúmenes

```bash
# Listar volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect flyquest_app-data

# Eliminar volúmenes (⚠️ perderás los datos)
docker-compose down -v
```

### Ver qué está pasando dentro del contenedor

```bash
# Entrar al contenedor
docker-compose exec app sh

# Dentro del contenedor:
ls -la                    # Ver archivos
ps aux                    # Ver procesos
cat /app/server/data/bugs.json  # Ver datos
```

## 📦 Estructura de Archivos Docker

```
FLYQUEST/
├── Dockerfile                  # Dockerfile principal (app completa)
├── docker-compose.yml          # Orquestación de servicios
├── .dockerignore              # Archivos a ignorar en build
├── docker.sh                  # Script helper para comandos
├── server/
│   └── Dockerfile             # Dockerfile del backend (standalone)
├── frontend/
│   └── Dockerfile             # Dockerfile del frontend (standalone)
└── scripts/
    └── Dockerfile             # Dockerfile del panel de mantenimiento
```

## 🔐 Seguridad

- ⚠️ **NO** incluyas archivos `.env` en el repositorio
- ⚠️ **NO** expongas puertos innecesarios
- ✅ Usa secrets de Docker para información sensible en producción
- ✅ Mantén las imágenes actualizadas

## 📊 Monitoreo

### Ver uso de recursos

```bash
# Estadísticas en tiempo real
docker stats flyquest-app

# Espacio usado
docker system df
```

### Health Check

El contenedor incluye un health check que verifica:

- El servidor responde en el endpoint `/api/mantenimiento/estado`
- Intervalo: cada 30 segundos
- Timeout: 10 segundos

```bash
# Ver estado de salud
docker inspect flyquest-app | grep -A 10 Health
```

## 🚀 Deployment

Para producción, considera usar:

1. **Render**: Ya configurado con `package.json`
2. **Docker Hub + VPS**: Sube la imagen y despliega
3. **Kubernetes**: Para alta disponibilidad

### Ejemplo para VPS con Docker

```bash
# En el servidor
git clone https://github.com/Rubencalii/FLYQUEST.git
cd FLYQUEST

# Crear .env con tus credenciales
nano server/.env

# Iniciar
docker-compose up -d

# Configurar Nginx como proxy reverso (opcional)
# Apuntar el dominio al puerto 4001
```

## 📚 Recursos Adicionales

- [Documentación oficial de Docker](https://docs.docker.com/)
- [Docker Compose reference](https://docs.docker.com/compose/compose-file/)
- [Best practices para Dockerfiles](https://docs.docker.com/develop/dev-best-practices/)

---

¿Problemas? Abre un issue en GitHub o contacta al equipo de desarrollo.
