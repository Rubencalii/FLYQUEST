# 🚀 Guía de Despliegue - FlyQuest Dashboard

## 📋 Índice
- [Requisitos Previos](#requisitos-previos)
- [Configuración de API Key](#configuración-de-api-key)
- [Despliegue Local](#despliegue-local)
- [Despliegue con Docker](#despliegue-con-docker)
- [Despliegue en la Nube](#despliegue-en-la-nube)
- [Variables de Entorno](#variables-de-entorno)
- [Troubleshooting](#troubleshooting)

---

## 🔑 Requisitos Previos

### Mínimo
- Node.js 18+ **O** Docker + Docker Compose
- Puertos 3001 y 4001 disponibles

### Para Datos Reales
- **API Key de Riot Games** (https://developer.riotgames.com/)

---

## 🔐 Configuración de API Key

### 1. Obtener API Key

1. Ve a https://developer.riotgames.com/
2. Inicia sesión con tu cuenta de Riot
3. Ve a "APPLICATIONS" → "PERSONAL API KEYS"
4. Copia tu API Key (empieza con `RGAPI-`)

### 2. Configurar en el Proyecto

#### Opción A: Archivo .env (Recomendado)
```bash
# En la raíz del proyecto
echo "RIOT_API_KEY=RGAPI-tu-key-aqui" > .env
```

#### Opción B: Variable de entorno
```bash
export RIOT_API_KEY="RGAPI-tu-key-aqui"
```

#### Opción C: Docker Compose
```yaml
# En docker-compose.yml
services:
  server:
    environment:
      - RIOT_API_KEY=RGAPI-tu-key-aqui
```

---

## 💻 Despliegue Local

### Modo Desarrollo (Recomendado para desarrollo)

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/FLYQUEST.git
cd FLYQUEST

# 2. Instalar dependencias
npm run install:all

# 3. Configurar API Key (opcional)
echo "RIOT_API_KEY=tu-key" > .env

# 4. Iniciar en modo desarrollo
./dev.sh
```

**URLs**:
- Frontend: http://localhost:3001
- Backend API: http://localhost:4001

### Detener Servicios

```bash
./stop.sh
# O presiona Ctrl+C si usaste ./dev.sh
```

---

## 🐳 Despliegue con Docker

### Inicio Rápido

```bash
# 1. Configurar API Key (opcional)
echo "RIOT_API_KEY=tu-key" > .env

# 2. Iniciar con Docker
./start.sh

# O manualmente:
docker-compose up --build -d
```

### Comandos Docker Útiles

```bash
# Ver logs
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Reconstruir desde cero
docker-compose down -v
docker-compose up --build -d
```

---

## ☁️ Despliegue en la Nube

### 1. Heroku

#### Backend
```bash
# Crear app de Heroku
heroku create flyquest-api

# Configurar API Key
heroku config:set RIOT_API_KEY=tu-key -a flyquest-api

# Desplegar (desde carpeta server/)
cd server
git init
heroku git:remote -a flyquest-api
git add .
git commit -m "Deploy backend"
git push heroku main
```

#### Frontend
```bash
# Crear app de frontend
heroku create flyquest-frontend

# Desplegar (desde carpeta frontend/)
cd frontend
git init
heroku git:remote -a flyquest-frontend
git add .
git commit -m "Deploy frontend"
git push heroku main
```

### 2. Vercel (Frontend) + Railway (Backend)

#### Vercel (Frontend)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar frontend
cd frontend
vercel

# Configurar variables de entorno en Vercel dashboard:
# VITE_API_URL=https://tu-backend.railway.app
```

#### Railway (Backend)
```bash
# 1. Ir a railway.app
# 2. New Project → Deploy from GitHub
# 3. Seleccionar carpeta /server
# 4. Agregar variable de entorno:
#    RIOT_API_KEY=tu-key
# 5. Deploy
```

### 3. DigitalOcean / AWS / GCP

#### Con Docker Compose

```bash
# 1. Crear droplet/instancia con Docker instalado

# 2. Conectar por SSH
ssh root@tu-servidor

# 3. Clonar repositorio
git clone https://github.com/tu-usuario/FLYQUEST.git
cd FLYQUEST

# 4. Configurar API Key
echo "RIOT_API_KEY=tu-key" > .env

# 5. Iniciar servicios
docker-compose up -d

# 6. Configurar nginx como reverse proxy (opcional)
# Ver sección de Nginx más abajo
```

---

## 🔧 Variables de Entorno

### Backend (server/)

| Variable | Descripción | Requerido | Default |
|----------|-------------|-----------|---------|
| `PORT` | Puerto del servidor | No | 4001 |
| `RIOT_API_KEY` | API Key de Riot Games | Sí* | - |
| `ADMIN_TOKEN` | Token para endpoints admin | No | - |
| `NODE_ENV` | Entorno (development/production) | No | development |

\* Requerido para obtener datos reales de partidos

### Frontend (frontend/)

| Variable | Descripción | Requerido | Default |
|----------|-------------|-----------|---------|
| `VITE_API_URL` | URL del backend | No | /api (proxy) |

---

## 🌐 Configuración de Nginx (Producción)

### Reverse Proxy para ambos servicios

```nginx
# /etc/nginx/sites-available/flyquest

server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar configuración:
```bash
sudo ln -s /etc/nginx/sites-available/flyquest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## �� HTTPS con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Auto-renovación (ya configurada)
sudo certbot renew --dry-run
```

---

## 🚨 Troubleshooting

### Error 403 en API

**Problema**: La API de Riot devuelve 403 Forbidden

**Solución**:
1. Verificar que tienes API Key configurada
2. Verificar que la API Key es válida (no expiró)
3. Verificar que está en la variable de entorno correcta

```bash
# Verificar variable de entorno
echo $RIOT_API_KEY

# O en el servidor:
docker-compose exec server env | grep RIOT
```

### Puerto ya en uso

**Problema**: Error "address already in use"

**Solución**:
```bash
# Encontrar proceso usando el puerto
lsof -i:4001
lsof -i:3001

# Matar proceso
kill -9 <PID>

# O usar el script
./stop.sh
```

### Frontend no conecta con Backend

**Problema**: Frontend no puede cargar partidos

**Solución**:
1. Verificar que backend esté corriendo:
   ```bash
   curl http://localhost:4001/api/flyquest/matches
   ```

2. Verificar proxy en `frontend/vite.config.js`:
   ```javascript
   proxy: {
     '/api': 'http://localhost:4001'
   }
   ```

3. En producción, verificar CORS en backend

### Docker no construye

**Problema**: Error al construir imágenes

**Solución**:
```bash
# Limpiar caché de Docker
docker system prune -a

# Reconstruir sin caché
docker-compose build --no-cache

# Verificar espacio en disco
df -h
```

---

## 📊 Monitoreo y Logs

### Ver logs en tiempo real

```bash
# Con Docker
docker-compose logs -f

# Solo backend
docker-compose logs -f server

# Solo frontend
docker-compose logs -f frontend

# Con script
./logs.sh
```

### Logs en servidor de producción

```bash
# Logs de nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs de aplicación
journalctl -u flyquest-backend -f
journalctl -u flyquest-frontend -f
```

---

## 🎯 Checklist de Despliegue

Antes de desplegar a producción:

- [ ] API Key de Riot configurada
- [ ] Variables de entorno configuradas
- [ ] Puertos correctos (3001, 4001)
- [ ] CORS configurado si frontend y backend en dominios diferentes
- [ ] HTTPS configurado (Let's Encrypt)
- [ ] Nginx reverse proxy configurado
- [ ] Firewall configurado (abrir puertos 80, 443)
- [ ] Monitoreo configurado (logs, uptime)
- [ ] Backups configurados
- [ ] Tests pasando
- [ ] Documentación actualizada

---

## 📚 Recursos Adicionales

- [Riot Games Developer Portal](https://developer.riotgames.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)

---

**¿Problemas?** Ejecuta `./check.sh` para diagnóstico automático.
