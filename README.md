# FlyQuest Dashboard

Proyecto fullstack: frontend React + TailwindCSS y backend Express que consulta la Riot/LoL Esports API.

## 🚀 Instrucciones rápidas (con Docker):

1. **El proyecto ya incluye un archivo `.env` configurado**. Si necesitas cambiarlo:

```bash
# Edita el archivo .env con tu configuración
RIOT_API_KEY=tu_api_key_aqui
ADMIN_TOKEN=tu_token_admin
```

2. **Levantar con Docker Compose**:

```bash
docker-compose up --build
```

3. **Acceder a la aplicación**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

## 📝 Notas importantes:

- ⚠️ **La API de LoL Esports es pública** y no requiere API key para consultas básicas
- 🔑 La `RIOT_API_KEY` está incluida para compatibilidad futura
- 🛡️ El `ADMIN_TOKEN` es necesario para acceder al panel de administración
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
