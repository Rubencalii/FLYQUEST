# Imagen base de Nginx para servir dashboard de mantenimiento
FROM nginx:stable-alpine

# Establecer directorio de trabajo
WORKDIR /usr/share/nginx/html

# Copiar archivos del dashboard de mantenimiento
COPY mantenimiento.html mantenimiento.css mantenimiento.js ./

# Copiar configuración personalizada de Nginx
COPY nginx-mantenimiento.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 8080
EXPOSE 8080

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
