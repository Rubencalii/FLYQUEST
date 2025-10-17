# Imagen base de Node.js (actualizada a v22)
FROM node:22-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Crear directorios necesarios para persistencia
RUN mkdir -p /app/data /app/logs

# Copiar código fuente
COPY . .

# Exponer puerto del backend
EXPOSE 4001

# Variables de entorno por defecto (se pueden sobreescribir con .env)
ENV NODE_ENV=production
ENV PORT=4001

# Comando para iniciar el servidor
CMD ["node", "index.js"]
