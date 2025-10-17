# 🚀 Guía de Despliegue - FlyQuest Dashboard

## 🌟 Opción Recomendada: **Vercel**

### ¿Por qué Vercel?

- ✅ **100% Gratis** para proyectos personales
- ✅ **Deploy en 2 minutos**
- ✅ **HTTPS automático**
- ✅ **CDN global** (ultra rápido en todo el mundo)
- ✅ **Perfecto** para React + Node.js
- ✅ **Auto-deploy** desde GitHub
- ✅ **Sin límites** de ancho de banda para hobby projects

---

## 📋 Pasos para Desplegar en Vercel

### 1️⃣ Preparar el Proyecto

Primero, necesitamos crear un archivo de configuración:

```bash
# Desde la raíz del proyecto
cd c:\Users\ruben\Desktop\FLYQUEST
```

Crear `vercel.json` en la raíz:

```json
{
  "version": 2,
  "name": "flyquest-dashboard",
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/teamLogos.json",
      "dest": "/frontend/public/teamLogos.json"
    },
    {
      "src": "/rosterFlyQuest.json",
      "dest": "/frontend/public/rosterFlyQuest.json"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

Agregar script de build al `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "vercel-build": "npm run build"
  }
}
```

### 2️⃣ Subir a GitHub (si no lo has hecho)

```bash
# Inicializar Git si no existe
git init
git add .
git commit -m "Preparando deploy a Vercel"

# Crear repositorio en GitHub y subirlo
git remote add origin https://github.com/Rubencalii/FLYQUEST.git
git branch -M main
git push -u origin main
```

### 3️⃣ Deploy en Vercel

**Opción A: Usando la Web (Más fácil)**

1. Ve a [vercel.com](https://vercel.com)
2. Click en **"Sign Up"** → Usa tu cuenta de GitHub
3. Click en **"Add New Project"**
4. Selecciona tu repositorio **"FLYQUEST"**
5. Configura:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Click en **"Deploy"** 🚀

**Opción B: Usando CLI**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Sigue las instrucciones:
# - Set up and deploy? Yes
# - Which scope? (tu cuenta)
# - Link to existing project? No
# - What's your project's name? flyquest-dashboard
# - In which directory is your code? ./
# - Want to override settings? No
```

### 4️⃣ Configurar Variables de Entorno (Opcional)

Si necesitas variables secretas:

1. Ve a tu proyecto en Vercel Dashboard
2. Click en **"Settings"** → **"Environment Variables"**
3. Agrega:
   - `ADMIN_TOKEN`: tu token secreto
   - Cualquier otra variable necesaria

---

## 🔄 Alternativa: **Render** (Más Simple para Docker)

### Ventajas de Render

- ✅ Soporta tu `docker-compose.yml` actual
- ✅ No necesitas cambiar nada del código
- ✅ Plan gratuito generoso

### Pasos para Render:

1. **Ir a [render.com](https://render.com)**
2. **Sign Up** con GitHub
3. **New** → **Web Service**
4. Conectar repositorio **FLYQUEST**
5. Configurar:
   - **Name:** flyquest-dashboard
   - **Environment:** Docker
   - **Plan:** Free
6. Click **"Create Web Service"**
7. ✅ ¡Listo! Render lo despliega automáticamente

---

## 🚂 Alternativa: **Railway** (Recomendado para Proyectos con BD)

### Ventajas de Railway

- ✅ $5 gratis al mes
- ✅ Excelente para Docker
- ✅ Incluye PostgreSQL/MySQL gratis
- ✅ Deploy en segundos

### Pasos para Railway:

```bash
# 1. Instalar CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Inicializar proyecto
railway init

# 4. Deploy
railway up

# 5. Agregar dominio
railway domain
```

---

## 🪰 Alternativa: **Fly.io** (Mejor Performance)

### Ventajas de Fly.io

- ✅ Gratis hasta 3 VMs
- ✅ Perfecto para Docker
- ✅ Red global (bajo latency)
- ✅ Escalable

### Pasos para Fly.io:

```bash
# 1. Instalar CLI
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# 2. Login
fly auth login

# 3. Crear app
fly launch

# 4. Deploy
fly deploy
```

---

## 📊 Comparación Rápida

| Plataforma  | Precio   | Docker | Auto-Deploy | BD Incluida | Mejor Para            |
| ----------- | -------- | ------ | ----------- | ----------- | --------------------- |
| **Vercel**  | Gratis   | ❌     | ✅          | ❌          | Frontend + API simple |
| **Render**  | Gratis\* | ✅     | ✅          | ✅          | Proyectos completos   |
| **Railway** | $5/mes   | ✅     | ✅          | ✅          | Proyectos con BD      |
| **Fly.io**  | Gratis\* | ✅     | ✅          | ❌          | Alto rendimiento      |
| **Netlify** | Gratis   | ❌     | ✅          | ❌          | Solo frontend         |

\*Con límites

---

## 🎯 Mi Recomendación Final

### Para tu proyecto FlyQuest:

1. **🥇 Vercel** - Si quieres el deploy MÁS RÁPIDO y simple
2. **🥈 Render** - Si prefieres usar Docker sin cambios
3. **🥉 Railway** - Si planeas agregar base de datos después

---

## 🔒 Seguridad

Todas estas plataformas incluyen:

- ✅ **HTTPS/SSL automático**
- ✅ **DDoS protection**
- ✅ **Backups automáticos**
- ✅ **Variables de entorno seguras**
- ✅ **Logs y monitoreo**

---

## 🆘 Soporte

Si tienes problemas:

1. **Vercel:** [vercel.com/support](https://vercel.com/support)
2. **Render:** [render.com/docs](https://render.com/docs)
3. **Railway:** [docs.railway.app](https://docs.railway.app)
4. **Fly.io:** [fly.io/docs](https://fly.io/docs)

---

## 📝 Checklist Pre-Deploy

- [ ] Código subido a GitHub
- [ ] `vercel.json` creado (si usas Vercel)
- [ ] Variables de entorno configuradas
- [ ] Build funciona localmente: `npm run build`
- [ ] API funciona localmente: `node server/index.js`
- [ ] README actualizado con URL de producción

---

## 🎉 Próximos Pasos

Después del deploy:

1. **Prueba tu app** en la URL generada
2. **Configura dominio personalizado** (opcional)
3. **Activa analytics** para ver tráfico
4. **Configura alertas** para downtime
5. **Agrega badge** al README:
   ```markdown
   [![Deploy](https://vercel.com/button)](https://tu-app.vercel.app)
   ```

---

**¿Necesitas ayuda?** Solo dime con qué plataforma quieres ir y te ayudo paso a paso! 🚀
