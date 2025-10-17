# Etapa 1: Build del Frontend
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

# Copiar archivos de dependencias del frontend
COPY frontend/package.json frontend/package-lock.json* ./

# Instalar dependencias del frontend
RUN npm ci

# Copiar código fuente del frontend
COPY frontend/ ./

# Construir la aplicación React para producción
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

# Exponer puerto del servidor
EXPOSE 4001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=4001

# Comando para iniciar el servidor (que también sirve el frontend)
CMD ["node", "index.js"]
