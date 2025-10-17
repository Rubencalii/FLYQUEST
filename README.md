# FlyQuest Dashboard - Live Edition 2025 🏆🔴

[![Deploy Status](https://img.shields.io/badge/Deploy-Live-brightgreen)](https://flyquest-3.onrender.com/)
[![API Status](https://img.shields.io/badge/API-Active-success)](https://flyquest-3.onrender.com/api/flyquest/matches)

**🌐 LIVE:** [https://flyquest-3.onrender.com/](https://flyquest-3.onrender.com/)

Proyecto fullstack: frontend React + TailwindCSS y backend Express que muestra información **100% ACTUALIZADA** de **FlyQuest** en todas las competiciones usando **LoL Esports Official API** (Riot Games).

## 🌟 Características principales

### 🔴 Datos en tiempo real

- 📊 **Worlds 2025** - Campeonato Mundial en vivo
- 🏆 **LTA North** - Temporada actual de Norteamérica
- 🌍 **MSI** - Mid-Season Invitational
- 🎮 **Todas las competiciones** internacionales

### ⚡ Actualización automática

- 🔄 Integración con **LoL Esports Official API** (Riot Games)
- ⏱️ Refresco automático cada 30 segundos
- 📅 Partidos históricos y próximos (últimos 3 meses)
- 🎮 Resultados en vivo durante los partidos

### 🎨 Interfaz moderna

- 📱 Diseño responsivo con TailwindCSS
- 🌙 Modo oscuro/claro
- 🌐 Multiidioma (ES/EN)
- 🕐 Selector de zona horaria
- 🐛 Sistema de reporte de bugs
- ⚙️ Panel de administración

### �️ Dashboard de Mantenimiento

- 🔍 Testear conexión con PandaScore API
- 📊 Monitoreo del estado de servicios
- 📈 Historial de disponibilidad de FlyQuest
- 📋 Visualización de logs del sistema
- ⬆️ Actualización de dependencias
- 🔄 Reinicio remoto del backend

## 🐳 Deployment con Docker (Recomendado)

### Requisitos previos

- Docker 20.10 o superior
- Docker Compose 1.29 o superior

### 1️⃣ Configuración inicial

**¡No necesitas configurar nada!** La API de LoL Esports usa una key pública que ya está incluida.

(Opcional) Si quieres personalizar el token de administrador, crea `server/.env`:

```bash
# Token de administrador (opcional)
ADMIN_TOKEN=tu_token_admin_secreto

# La API key de LoL Esports ya está incluida en el código
# LOL_ESPORTS_API_KEY=0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z
```

### 2️⃣ Deployment automático

Usa el script de deployment incluido:

```bash
# Deployment normal
./deploy.sh

# Deployment con limpieza de imágenes antiguas
./deploy.sh --clean
```

### 3️⃣ Deployment manual

O ejecuta los comandos manualmente:

```bash
# Construir las imágenes
docker-compose build

# Iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver estado de los servicios
docker-compose ps
```

## 🌐 Acceso a los servicios

**Arquitectura actualizada (2025)**: Todo se sirve desde un solo puerto

| Servicio          | URL                                                    | Descripción                              |
| ----------------- | ------------------------------------------------------ | ---------------------------------------- |
| **Dashboard**     | http://localhost:4001                                  | Aplicación completa (Frontend + Backend) |
| **API REST**      | http://localhost:4001/api                              | Endpoints de la API                      |
| **Mantenimiento** | http://localhost:4001/mantenimiento/mantenimiento.html | Panel de administración                  |

> 💡 **Nota**: La nueva arquitectura usa un solo contenedor que sirve todo en el puerto 4001

## 🐳 Arquitectura Docker Actualizada (2025)

El proyecto ahora usa **arquitectura monolítica optimizada** (un solo contenedor):

```
┌─────────────────────────────────────────────────────┐
│                  flyquest-network                    │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │           flyquest-app (Container)            │  │
│  │                                               │  │
│  │  ┌─────────────────────────────────────────┐ │  │
│  │  │  Node.js 22 + Express Server            │ │  │
│  │  │  Port: 4001                             │ │  │
│  │  │                                         │ │  │
│  │  │  ├─ 📂 /api/*        → Backend API     │ │  │
│  │  │  ├─ 📂 /            → Frontend (React) │ │  │
│  │  │  └─ 📂 /mantenimiento/* → Admin Panel  │ │  │
│  │  └─────────────────────────────────────────┘ │  │
│  │                                               │  │
│  │  Volúmenes:                                   │  │
│  │  • app-data (bugs.json, datos persistentes)  │  │
│  │  • app-logs (logs del sistema)               │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### ✅ Ventajas de esta arquitectura

- **Un solo contenedor**: Más simple de gestionar y desplegar
- **Backend sirve el frontend**: Sin CORS, sin configuración de proxy
- **Build multi-stage optimizado**: Node.js 22 con compilación de React
- **Persistencia de datos**: Volúmenes Docker para bugs y logs
- **Compatible con Render**: Mismo código para Docker y cloud

### Volúmenes persistentes

Los siguientes datos se almacenan en volúmenes Docker:

- `app-data`: Datos de bugs reportados (bugs.json)
- `app-logs`: Logs del sistema y errores

## 🛠️ Comandos útiles de Docker

### Con el script helper (Recomendado)

```bash
./docker.sh up          # Iniciar contenedores
./docker.sh down        # Detener contenedores
./docker.sh restart     # Reiniciar contenedores
./docker.sh logs        # Ver logs en tiempo real
./docker.sh status      # Ver estado
./docker.sh rebuild     # Reconstruir desde cero
./docker.sh help        # Ver todos los comandos
```

### Gestión manual con Docker Compose

```bash
# Detener el servicio
docker-compose down

# Reiniciar el contenedor
docker-compose restart app

# Ver logs en tiempo real
docker-compose logs -f app

# Acceder al shell del contenedor
docker exec -it flyquest-app sh

# Reconstruir y reiniciar
docker-compose build --no-cache
docker-compose up -d
```

### Limpieza

```bash
# Detener y eliminar contenedores, redes
docker-compose down

# Detener y eliminar todo (incluidos volúmenes)
docker-compose down -v

# Limpiar imágenes no utilizadas
docker system prune -a
```

## � Desarrollo local (sin Docker)

Si prefieres ejecutar sin Docker:

### Backend

```bash
cd server
npm install
node index.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📝 Notas importantes

- ⚠️ **PandaScore API** requiere un token válido (obtén uno en https://pandascore.co/)
- 🔑 El token se configura en `server/.env` como `PANDASCORE_API_KEY`
- 🛡️ El `ADMIN_TOKEN` protege el acceso al panel de administración
- 📊 Los datos se actualizan automáticamente cada 30 segundos
- 💾 Los volúmenes Docker persisten datos entre reinicios
- 🐛 Puedes reportar bugs desde el botón "Reportar fallo" en la interfaz

## 🛠️ Comandos útiles:

```bash
# Detener los contenedores
docker-compose down

# Ver logs en tiempo real
docker-compose logs -f

# Reconstruir sin caché
docker-compose build --no-cache
```

## 📦 Estructura del proyecto:

```powershell
# Backend
cd C:\Users\ruben\Desktop\FLYQUEST\server
npm install
$env:RIOT_API_KEY = 'tu_api_key_aqui'
node index.js

# Frontend (dev)
cd C:\Users\ruben\Desktop\FLYQUEST\frontend
npm install
npm run dev
```

VSCode: para evitar advertencias de CSS relacionadas con las directivas `@tailwind` y `@apply`, se añadió `.vscode/settings.json`. Se recomienda instalar la extensión "Tailwind CSS IntelliSense".

Bug reporting y Admin:

- Para reportar un bug desde la UI: en el dashboard pulsa "Reportar fallo" y completa el formulario.
- Para acceder al Admin: pulsa "Admin" y proporciona `ADMIN_TOKEN` en la entrada del panel.

Si usas Docker Compose, añade `ADMIN_TOKEN` a tu `.env`:

```
RIOT_API_KEY=tu_api_key
ADMIN_TOKEN=tu_token_admin
```

El servidor expone:

- POST /api/flyquest/bugs -> crea un bug (body: title, description, url, severity)
- GET /api/flyquest/bugs -> lista bugs (requiere header x-admin-token)
