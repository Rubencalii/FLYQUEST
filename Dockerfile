# Etapa 1: Build del Frontend
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

# Copiar archivos de dependencias del frontend
COPY frontend/package.json frontend/package-lock.json* ./

# Instalar dependencias del frontend (incluye chart.js y react-chartjs-2)
RUN npm ci

# Copiar archivos de configuración
COPY frontend/vite.config.js frontend/tailwind.config.js frontend/postcss.config.js ./
COPY frontend/index.html ./

# Copiar código fuente del frontend (incluye nuevos componentes)
COPY frontend/src ./src
COPY frontend/public ./public

# Construir la aplicación React para producción
# Incluye: Achievements, AdvancedAlerts, PlayerStats, Chart.js optimizaciones
RUN npm run build

# Etapa 2: Setup del Backend con Frontend compilado
FROM node:22-alpine

WORKDIR /app

# Copiar archivos de dependencias del servidor
COPY server/package.json server/package-lock.json* ./server/

# Instalar dependencias del servidor
WORKDIR /app/server
RUN npm ci --only=production

# Crear directorios necesarios para persistencia
RUN mkdir -p /app/server/data /app/logs

# Copiar código fuente del servidor
COPY server/ ./

# Copiar el build del frontend desde la etapa anterior
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Copiar los scripts de mantenimiento
COPY scripts/ /app/scripts/

# Copiar documentación importante
COPY CHARTJS_GUIDE.md NUEVAS_FUNCIONALIDADES.md /app/docs/

# Exponer puerto del servidor
EXPOSE 4001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=4001

# Healthcheck para monitoreo
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4001/api/mantenimiento/estado', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar el servidor (que también sirve el frontend)
CMD ["node", "index.js"]
