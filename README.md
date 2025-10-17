# FlyQuest Dashboard - Live Edition 2025 🏆🔴

Proyecto fullstack: frontend React + TailwindCSS y backend Express que muestra información **100% ACTUALIZADA** de **FlyQuest** en todas las competiciones usando PandaScore API.

## 🌟 Características principales

### 🔴 Datos en tiempo real
- 📊 **Worlds 2025** - Campeonato Mundial en vivo
- 🏆 **LCS** - Temporada actual de Norteamérica
- 🌍 **MSI** - Mid-Season Invitational
- 🎮 **Todas las competiciones** internacionales

### ⚡ Actualización automática
- 🔄 Integración con PandaScore API
- ⏱️ Refresco automático cada 30 segundos
- 📅 Partidos históricos y próximos del año actual
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

Crea el archivo de variables de entorno en `server/.env`:

```bash
# API de PandaScore (obligatorio)
PANDASCORE_API_KEY=tu_token_de_pandascore

# Token de administrador (opcional)
ADMIN_TOKEN=tu_token_admin_secreto
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

Una vez iniciados los contenedores:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:5173 | Dashboard principal de FlyQuest |
| **Backend API** | http://localhost:4001 | API REST del servidor |
| **Mantenimiento** | http://localhost:8080 | Panel de administración y monitoreo |

## � Arquitectura Docker

El proyecto usa 3 contenedores:

```
┌─────────────────────────────────────────────────────┐
│                  flyquest-network                    │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │   Backend    │  │  Frontend    │  │Mantenimiento││
│  │              │  │              │  │            ││
│  │ Node.js      │  │ React+Nginx  │  │  Nginx     ││
│  │ Express      │  │              │  │  HTML/CSS  ││
│  │ Port: 4001   │  │ Port: 5173   │  │  Port:8080 ││
│  └──────────────┘  └──────────────┘  └────────────┘│
│         │                                           │
│  ┌──────┴─────┐                                    │
│  │  Volumes   │                                    │
│  │  - data    │                                    │
│  │  - logs    │                                    │
│  └────────────┘                                    │
└─────────────────────────────────────────────────────┘
```

### Volúmenes persistentes

Los siguientes datos se almacenan en volúmenes Docker:

- `backend-data`: Datos de bugs reportados
- `backend-logs`: Logs del sistema

## 🛠️ Comandos útiles

### Gestión de contenedores

```bash
# Detener todos los servicios
docker-compose down

# Reiniciar un servicio específico
docker-compose restart backend

# Ver logs de un servicio específico
docker-compose logs -f frontend

# Acceder al shell de un contenedor
docker exec -it flyquest-backend sh

# Reconstruir solo un servicio
docker-compose build backend
docker-compose up -d backend
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
