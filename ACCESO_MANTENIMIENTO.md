# 🛠️ Acceso al Panel de Mantenimiento

## ✅ ¡Ya está configurado!

Después de que Render termine el deploy (2-3 minutos), podrás acceder al panel de mantenimiento en:

```
🌐 https://flyquest-3.onrender.com/mantenimiento/mantenimiento.html
```

O más simple:
```
🌐 https://flyquest-3.onrender.com/mantenimiento/
```

---

## 🎮 Funcionalidades del Panel

### 🔍 **Test API**
- Verifica conexión con LoL Esports API
- Muestra estado de FlyQuest en la API

### 📊 **Estado de Servicios**
- Ver uptime del servidor
- Memoria utilizada
- Puerto y configuración

### 📈 **Historial FlyQuest**
- Ver eventos recientes de FlyQuest
- Completados, próximos y en progreso
- Total de partidos disponibles

### 📋 **Logs del Sistema**
- Ver últimos logs del servidor
- Útil para debugging

### ⬆️ **Actualizar Dependencias**
- Ejecuta `npm install` remotamente
- Actualiza paquetes del servidor

### 🔄 **Reiniciar Backend**
- Reinicia el servidor Node.js
- Útil después de cambios

---

## 📱 Accesos Directos

### Panel de Mantenimiento:
```
https://flyquest-3.onrender.com/mantenimiento/mantenimiento.html
```

### API de Mantenimiento (Endpoints):

**Test API:**
```
https://flyquest-3.onrender.com/api/mantenimiento/test-api
```

**Estado del Servidor:**
```
https://flyquest-3.onrender.com/api/mantenimiento/estado
```

**Estado de FlyQuest:**
```
https://flyquest-3.onrender.com/api/mantenimiento/estado-flyquest
```

**Logs:**
```
https://flyquest-3.onrender.com/api/mantenimiento/logs
```

---

## 🔒 Seguridad

El panel de mantenimiento está **público** pero las operaciones peligrosas (como reiniciar) piden confirmación.

### Para mayor seguridad (opcional):
Puedes agregar autenticación básica en el futuro si lo necesitas.

---

## ⏱️ Tiempo de Espera

- **Render detectará el cambio:** Automático
- **Deploy completo:** 2-3 minutos
- **Panel disponible:** Después del deploy

---

## ✅ Verificación

Una vez que Render termine el deploy, prueba:

1. **Abre el panel:**
   ```
   https://flyquest-3.onrender.com/mantenimiento/mantenimiento.html
   ```

2. **Haz clic en "Testear API"**
   - Debería mostrar: "✅ API LoL Esports OK"

3. **Haz clic en "Estado de Servicios"**
   - Debería mostrar: puerto, uptime, memoria

---

## 🎨 Interfaz del Panel

El panel tiene:
- ✅ **Diseño moderno** con gradientes
- ✅ **Responsive** (funciona en móvil)
- ✅ **Estados en tiempo real** (Backend, API)
- ✅ **Botones organizados** por función
- ✅ **Área de resultados** con colores según el tipo

---

## 🐛 Si no funciona

### Error 404 al acceder:
1. Espera a que Render termine el deploy
2. Verifica que los archivos scripts/ estén en GitHub
3. Revisa los logs en Render Dashboard

### Los botones no funcionan:
- Verifica que la API esté activa
- Revisa la consola del navegador (F12)

---

## 📝 Archivos del Panel

Los archivos están en la carpeta `scripts/`:

```
scripts/
├── mantenimiento.html   (Interfaz del panel)
├── mantenimiento.css    (Estilos)
└── mantenimiento.js     (Funcionalidad)
```

---

## 🎉 ¡Listo!

En **2-3 minutos** podrás acceder a tu panel de mantenimiento en:

```
🌐 https://flyquest-3.onrender.com/mantenimiento/mantenimiento.html
```

---

**Última actualización:** Commit 42793e7  
**Estado:** ✅ Configurado y subido a GitHub  
**Próximo paso:** Esperar deploy de Render
