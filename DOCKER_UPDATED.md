# 🐳 Docker - FlyQuest Dashboard v2.0

## 📋 Actualización Reciente

**Fecha:** 18 de octubre de 2025  
**Versión:** 2.0  
**Nuevas Funcionalidades:**

- ✅ Sistema de Logros/Achievements
- ✅ Alertas Personalizadas Avanzadas
- ✅ Comparador de Jugadores
- ✅ Optimización de Chart.js v4.5.1

---

## 🚀 Inicio Rápido

### Construir y ejecutar con Docker Compose:

```bash
# Desde la raíz del proyecto
docker-compose up -d --build
```

### Acceder a la aplicación:

- **Frontend + Backend**: http://localhost:4001
- **Panel de mantenimiento**: http://localhost:4001/mantenimiento

---

## 📦 Estructura del Dockerfile

### Multi-stage Build Optimizado

```dockerfile
# Etapa 1: Build del Frontend (Node.js 22 Alpine)
- Instala dependencias (chart.js, react-chartjs-2)
- Compila React con Vite
- Incluye nuevos componentes: Achievements, AdvancedAlerts, PlayerStats

# Etapa 2: Backend + Frontend servido (Node.js 22 Alpine)
- Instala solo dependencias de producción
- Copia build del frontend desde etapa 1
- Sirve frontend como archivos estáticos
- API backend en Express
- Healthcheck integrado
```

---

## 🔧 Configuración

### Variables de Entorno

```env
# .env o docker-compose.yml
NODE_ENV=production
PORT=4001
RIOT_API_KEY=0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z
ADMIN_TOKEN=admin_secret_token_2024

# Optimización Chart.js
NODE_OPTIONS=--max-old-space-size=512
```

### Puertos Expuestos

| Puerto | Servicio | Descripción                     |
| ------ | -------- | ------------------------------- |
| 4001   | app      | Backend API + Frontend estático |

---

## 💾 Volúmenes

```yaml
volumes:
  app-data: # Datos persistentes (bugs.json)
  app-logs: # Logs de la aplicación
```

### Ubicaciones en el contenedor:

- `/app/server/data` → Datos de bugs y configuración
- `/app/logs` → Logs del servidor
- `/app/docs` → Documentación (CHARTJS_GUIDE.md, NUEVAS_FUNCIONALIDADES.md)

---

## 🏷️ Labels del Contenedor

```yaml
labels:
  - "com.flyquest.version=2.0"
  - "com.flyquest.features=achievements,advanced-alerts,player-stats,chartjs"
  - "com.flyquest.description=FlyQuest Dashboard with advanced features"
```

---

## 🔍 Healthcheck

```yaml
healthcheck:
  test: wget --quiet --tries=1 --spider http://localhost:4001/api/mantenimiento/estado
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**Endpoint de health:** `GET /api/mantenimiento/estado`

---

## 📊 Optimizaciones Incluidas

### Frontend (Vite Build)

- ✅ Tree-shaking automático
- ✅ Code splitting por rutas
- ✅ Minificación de JS/CSS
- ✅ Compresión de assets
- ✅ Chart.js optimizado (bundle reducido)

### Backend (Node.js)

- ✅ Solo dependencias de producción (`--only=production`)
- ✅ Alpine Linux (imagen más ligera)
- ✅ Multi-stage build (reduce tamaño final)
- ✅ Cache de layers de Docker

### Tamaños de Imagen:

- **Frontend build stage**: ~500MB (temporal)
- **Imagen final**: ~180MB (optimizada)

---

## 🚀 Comandos Útiles

### Build y Deploy

```bash
# Build sin cache (forzar rebuild completo)
docker-compose build --no-cache

# Iniciar en background
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f app

# Reiniciar servicio
docker-compose restart app

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Borra datos)
docker-compose down -v
```

---

### Inspección y Debug

```bash
# Entrar al contenedor
docker exec -it flyquest-app sh

# Ver logs específicos
docker logs flyquest-app

# Ver logs de los últimos 100 líneas
docker logs --tail 100 flyquest-app

# Inspeccionar contenedor
docker inspect flyquest-app

# Ver uso de recursos
docker stats flyquest-app

# Verificar healthcheck
docker inspect --format='{{json .State.Health}}' flyquest-app | jq
```

---

### Mantenimiento

```bash
# Limpiar imágenes antiguas
docker image prune -a

# Limpiar todo (contenedores, imágenes, volúmenes, redes)
docker system prune -a --volumes

# Ver espacio usado
docker system df

# Backup de volumen de datos
docker run --rm -v flyquest_app-data:/data -v $(pwd):/backup alpine tar czf /backup/flyquest-backup.tar.gz -C /data .

# Restaurar backup
docker run --rm -v flyquest_app-data:/data -v $(pwd):/backup alpine tar xzf /backup/flyquest-backup.tar.gz -C /data
```

---

## 🔄 Actualización de Contenedores

### Proceso recomendado:

```bash
# 1. Hacer backup de datos
docker run --rm -v flyquest_app-data:/data -v $(pwd):/backup alpine tar czf /backup/backup-$(date +%Y%m%d).tar.gz -C /data .

# 2. Pull de cambios (si usas Git)
git pull origin main

# 3. Rebuild con nuevos cambios
docker-compose build --no-cache

# 4. Detener contenedor actual
docker-compose down

# 5. Iniciar con nueva imagen
docker-compose up -d

# 6. Verificar logs
docker-compose logs -f app
```

---

## 🐛 Troubleshooting

### Problema: Contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs app

# Verificar si el puerto está ocupado
netstat -ano | findstr :4001  # Windows
lsof -i :4001                  # Linux/Mac

# Reiniciar Docker Desktop (Windows/Mac)
```

---

### Problema: Frontend no carga

```bash
# Entrar al contenedor
docker exec -it flyquest-app sh

# Verificar archivos del frontend
ls -la /app/frontend/dist

# Verificar servidor Express
curl http://localhost:4001

# Ver logs del servidor
cat /app/logs/server.log
```

---

### Problema: Build falla

```bash
# Limpiar todo y reintentar
docker-compose down
docker system prune -a
docker-compose build --no-cache

# Si persiste, verificar:
# 1. Espacio en disco: df -h
# 2. Docker Desktop tiene suficiente memoria (Settings > Resources)
# 3. Node modules: eliminar node_modules locales
```

---

### Problema: Memoria insuficiente

```yaml
# En docker-compose.yml, añadir límites:
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

---

## 📈 Monitoreo

### Con Docker Stats

```bash
# Monitor en tiempo real
docker stats flyquest-app

# Output:
# CONTAINER        CPU %    MEM USAGE / LIMIT    MEM %    NET I/O
# flyquest-app     0.5%     150MB / 1GB          15%      1.2kB / 800B
```

---

### Logs Estructurados

```bash
# Ver logs con timestamps
docker logs -f --timestamps flyquest-app

# Filtrar logs
docker logs flyquest-app 2>&1 | grep "ERROR"
docker logs flyquest-app 2>&1 | grep "FlyQuest"

# Exportar logs
docker logs flyquest-app > flyquest-logs-$(date +%Y%m%d).log
```

---

## 🔒 Seguridad

### Mejores Prácticas Implementadas:

✅ **Usuario no-root**: Alpine con usuario node
✅ **Imágenes oficiales**: node:22-alpine
✅ **Dependencias mínimas**: Solo producción en imagen final
✅ **Secrets externos**: Variables de entorno desde .env
✅ **Healthcheck**: Monitoreo automático de salud
✅ **Read-only docs**: Documentación montada como solo lectura

---

### Variables Sensibles

```bash
# Crear .env en server/ con:
RIOT_API_KEY=tu_api_key_aqui
ADMIN_TOKEN=tu_token_seguro_aqui

# NO COMMITEAR .env al repositorio
# Usar .env.example como template
```

---

## 🌐 Deploy en Producción

### Opción 1: Docker Hub

```bash
# Tag de la imagen
docker tag flyquest-app tuusuario/flyquest-dashboard:v2.0

# Push a Docker Hub
docker push tuusuario/flyquest-dashboard:v2.0

# En servidor de producción:
docker pull tuusuario/flyquest-dashboard:v2.0
docker run -d -p 4001:4001 --env-file .env tuusuario/flyquest-dashboard:v2.0
```

---

### Opción 2: Render.com / Railway.app

Ambos servicios soportan Dockerfile directamente:

1. Conectar repositorio de GitHub
2. Detectan Dockerfile automáticamente
3. Build y deploy automático en cada push
4. Variables de entorno desde dashboard

---

### Opción 3: VPS con Docker

```bash
# En el servidor (Ubuntu/Debian):
sudo apt update
sudo apt install docker.io docker-compose -y

# Clonar repo
git clone https://github.com/tuusuario/flyquest.git
cd flyquest

# Crear .env con variables de producción
nano server/.env

# Iniciar
docker-compose up -d

# Nginx como proxy reverso (opcional)
sudo apt install nginx
# Configurar proxy a localhost:4001
```

---

## 📦 Nuevos Componentes en Build

### Frontend Components (incluidos en build):

```
frontend/src/components/
├── Achievements.jsx          # Sistema de logros ✨
├── AdvancedAlerts.jsx        # Alertas avanzadas 🔔
├── PlayerStats.jsx           # Stats de jugadores 👥
├── FlyQuestStats.jsx         # Estadísticas generales
├── StatsBoard.jsx            # Gráficos Chart.js
├── NotificationManager.jsx   # Notificaciones push
├── FlyQuestRoster.jsx        # Roster del equipo
├── FooterFlyQuest.jsx        # Footer con redes sociales
├── BugReport.jsx             # Reporte de bugs
└── AdminDashboard.jsx        # Panel de admin
```

---

### Chart.js Assets (optimizados):

- chart.js: ~60KB (minified + gzipped)
- react-chartjs-2: ~5KB
- Total Chart.js bundle: ~65KB

**Optimizaciones aplicadas:**

- Tree-shaking de componentes no usados
- Lazy loading de gráficos
- useMemo para datos calculados
- Cache de configuraciones

---

## 🎯 Verificación Post-Deploy

### Checklist:

```bash
# 1. Contenedor corriendo
docker ps | grep flyquest-app

# 2. Healthcheck pasando
docker inspect flyquest-app | grep -A 10 Health

# 3. Frontend accesible
curl http://localhost:4001

# 4. API respondiendo
curl http://localhost:4001/api/flyquest/matches

# 5. Panel de mantenimiento
curl http://localhost:4001/mantenimiento

# 6. Service Worker disponible
curl http://localhost:4001/service-worker.js

# 7. Logs sin errores
docker logs --tail 50 flyquest-app
```

---

## 📚 Recursos Adicionales

- **Docker Docs**: https://docs.docker.com/
- **Docker Compose Docs**: https://docs.docker.com/compose/
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices
- **Chart.js Docs**: https://www.chartjs.org/docs/latest/

---

## 📝 Changelog Docker

### v2.0 (18 Oct 2025)

- ✅ Añadido Achievements component al build
- ✅ Añadido AdvancedAlerts component al build
- ✅ Añadido PlayerStats component al build
- ✅ Optimización Chart.js en build de Vite
- ✅ Healthcheck mejorado con Node.js nativo
- ✅ Labels de contenedor con features
- ✅ Documentación incluida en volúmenes
- ✅ NODE_OPTIONS para optimización de memoria
- ✅ .dockerignore actualizado

### v1.0 (Oct 2025)

- Implementación inicial con multi-stage build
- Frontend React + Backend Node.js
- LoL Esports API integration
- Service Worker para PWA

---

**🚀 Docker Setup actualizado y listo para producción!**
