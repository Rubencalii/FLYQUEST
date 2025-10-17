# 🌐 Opciones de Hosting para FlyQuest

## ❌ GitHub Pages - NO es suficiente para este proyecto

**GitHub Pages** solo sirve para sitios estáticos (HTML/CSS/JS):
- ❌ No soporta Node.js backend
- ❌ No puede ejecutar Express
- ❌ No puede hacer llamadas a APIs desde el servidor

**Tu proyecto necesita:**
- ✅ Backend Node.js corriendo 24/7
- ✅ Base de datos/almacenamiento persistente
- ✅ Variables de entorno seguras

---

## ✅ MEJORES OPCIONES (TODAS GRATUITAS)

### 🥇 **1. Railway.app** (RECOMENDADO - Más fácil)

**Por qué es la mejor opción:**
- ✅ Plan gratuito generoso (500 horas/mes)
- ✅ Detecta Docker automáticamente
- ✅ Deploy en 2 minutos
- ✅ URLs públicas automáticas
- ✅ SSL/HTTPS gratis
- ✅ Variables de entorno fáciles de configurar
- ✅ Logs en tiempo real

**Pasos para desplegar:**

```bash
# 1. Ve a https://railway.app
# 2. Haz login con tu cuenta de GitHub
# 3. Click en "New Project"
# 4. Selecciona "Deploy from GitHub repo"
# 5. Elige tu repositorio: Rubencalii/FLYQUEST
# 6. Railway detectará Docker automáticamente
# 7. Añade variables de entorno:
#    - PANDASCORE_API_KEY = tu_token_aqui
#    - ADMIN_TOKEN = tu_admin_token
# 8. ¡Deploy! Te dará 3 URLs públicas automáticamente
```

**URLs que obtendrás:**
- `https://flyquest-backend-xxx.railway.app` (Backend)
- `https://flyquest-frontend-xxx.railway.app` (Frontend)
- `https://flyquest-mantenimiento-xxx.railway.app` (Panel admin)

---

### 🥈 **2. Render.com** (Alternativa sólida)

**Características:**
- ✅ 750 horas gratis/mes
- ✅ Soporta Docker
- ✅ SSL gratis
- ✅ Auto-deploy desde GitHub

**Pasos:**

```bash
# 1. Ve a https://render.com
# 2. Sign up con GitHub
# 3. "New" → "Web Service"
# 4. Conecta tu repo: Rubencalii/FLYQUEST
# 5. Render detectará Docker
# 6. Configura cada servicio:
#    - Backend (puerto 4001)
#    - Frontend (puerto 5173)
#    - Mantenimiento (puerto 8080)
# 7. Añade variables de entorno
# 8. Deploy
```

⚠️ **Nota:** Los servicios gratuitos se "duermen" después de 15 min sin uso.

---

### 🥉 **3. Vercel (Solo para Frontend) + Backend separado**

**Vercel** es perfecto para el **frontend React**, pero necesitarías el backend en otro lado:

**Para el Frontend:**
```bash
# 1. Instala Vercel CLI
npm i -g vercel

# 2. En la carpeta del proyecto
cd frontend
vercel

# 3. Sigue las instrucciones
# 4. Tu frontend estará en: https://flyquest.vercel.app
```

**Para el Backend:** Usa Railway o Render (opciones 1 o 2)

---

### 🏆 **4. Fly.io** (Más control técnico)

**Para usuarios avanzados:**
- ✅ Muy rápido
- ✅ Múltiples regiones
- ✅ Gratis hasta 3 apps

**Pasos:**

```bash
# 1. Instala Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Login
flyctl auth login

# 3. En tu proyecto
cd /home/usua5pc2/Escritorio/FLYQUEST

# 4. Launch cada servicio
cd server && flyctl launch --name flyquest-backend
cd ../frontend && flyctl launch --name flyquest-frontend
cd ../scripts && flyctl launch --name flyquest-admin

# 5. Configura variables de entorno
flyctl secrets set PANDASCORE_API_KEY=tu_token

# 6. Deploy
flyctl deploy
```

---

### 🌟 **5. Netlify (Solo Frontend) + Backend separado**

Similar a Vercel:
- ✅ Frontend en Netlify
- ✅ Backend en Railway/Render

```bash
# Frontend
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

---

## 🎯 MI RECOMENDACIÓN

**Para ti, te recomiendo Railway.app porque:**

1. ✅ **Es el más fácil** - Deploy en 2 minutos
2. ✅ **Detecta Docker automáticamente** - No necesitas configurar nada
3. ✅ **Despliega los 3 servicios juntos** - Backend, Frontend y Admin
4. ✅ **Plan gratuito generoso** - 500 horas/mes es suficiente
5. ✅ **URLs públicas automáticas** - No necesitas dominio propio
6. ✅ **SSL/HTTPS gratis** - Seguridad incluida
7. ✅ **Integración con GitHub** - Auto-deploy en cada push

---

## 📋 CHECKLIST RÁPIDO - RAILWAY

```
□ 1. Ir a https://railway.app
□ 2. Login con GitHub
□ 3. "New Project" → "Deploy from GitHub repo"
□ 4. Seleccionar: Rubencalii/FLYQUEST
□ 5. Esperar detección automática de Docker
□ 6. Añadir variables de entorno:
     PANDASCORE_API_KEY=tu_token
     ADMIN_TOKEN=admin123
□ 7. Deploy automático
□ 8. ¡Copiar URLs públicas y compartir!
```

**Tiempo estimado: 3-5 minutos** ⏱️

---

## 💰 COSTOS

| Plataforma | Plan Gratuito | Limitaciones |
|------------|---------------|--------------|
| **Railway** | 500h/mes | Suficiente para proyectos pequeños |
| **Render** | 750h/mes | Se duerme tras 15 min inactivo |
| **Vercel** | Ilimitado | Solo frontend |
| **Netlify** | Ilimitado | Solo frontend |
| **Fly.io** | 3 apps gratis | Límite de RAM |

---

## 🚀 PRÓXIMOS PASOS

**Opción recomendada: Railway**

1. Abre https://railway.app
2. Sigue los pasos del checklist
3. En 5 minutos tendrás tu app online
4. Comparte las URLs con quien quieras

**¿Necesitas ayuda con Railway?** Puedo guiarte paso a paso.

---

## 📝 NOTAS ADICIONALES

- Todas estas opciones son **100% gratuitas** para empezar
- Puedes actualizar a planes de pago después si necesitas más recursos
- Tu código en GitHub ya está listo para cualquiera de estas plataformas
- No necesitas modificar nada en tu código

