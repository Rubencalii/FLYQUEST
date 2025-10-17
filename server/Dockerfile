# Imagen base de Node.js
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci --only=production

# Crear directorios necesarios para persistencia
RUN mkdir -p /app/data /app/logs

# Copiar código fuente
COPY . .

# Exponer puerto del backend
EXPOSE 4001

# Variables de entorno por defecto (se pueden sobreescribir con .env)
ENV NODE_ENV=production

# Comando para iniciar el servidor
CMD ["node", "index.js"]
