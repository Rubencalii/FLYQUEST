# 🔄 SISTEMA DE ACTUALIZACIÓN AUTOMÁTICA

## Cómo funciona

El **FlyQuest Dashboard** está diseñado para mantenerse **100% actualizado** sin intervención manual.

---

## 🎯 Fuentes de datos

### APIs consultadas (en orden):
1. **Worlds API** → `leagueId=98767975604431411`
2. **LCS API** → `leagueId=98767991299243165`
3. **MSI API** → `leagueId=107898214974993351`
4. **LCS Proving Grounds** → `leagueId=98767991302996019`

---

## ⚙️ Proceso de actualización

```
┌─────────────────┐
│  Usuario carga  │
│   la página     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Frontend hace request   │
│ a /api/flyquest/matches │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Servidor consulta TODAS las APIs  │
│  (Worlds, LCS, MSI, etc.)          │
└────────┬───────────────────────────┘
         │
         ├──► ✅ API disponible
         │    └─► Devuelve partidos reales
         │
         └──► ❌ API no disponible
              └─► Datos de respaldo (últimos conocidos)
```

---

## 🔄 Frecuencia de actualización

- **Automática cada 30 segundos** desde el frontend
- **Manual** con botón "Refresh" en la interfaz
- **Al cargar** la página por primera vez

---

## 📊 Tipos de partidos mostrados

### Estados posibles:
- 🟢 **completed** - Partido finalizado con resultados
- 🔵 **inProgress** - Partido en curso ahora mismo
- 🟡 **upcoming** - Partido programado para el futuro
- ⚪ **unstarted** - Partido no comenzado

### Formato de partidos:
- **Bo1** - Best of 1 (grupos, fase regular)
- **Bo3** - Best of 3 (LCS regular)
- **Bo5** - Best of 5 (playoffs, eliminatorias)

---

## 🛠️ Datos de respaldo

Si las APIs no están disponibles, el sistema tiene datos de respaldo actualizados manualmente que incluyen:

✅ Últimos partidos conocidos de FlyQuest
✅ Partidos próximos estimados
✅ Resultados históricos recientes
✅ Todos con fechas realistas (octubre 2025)

---

## 🔧 Mantenimiento

### Para actualizar datos manualmente:

1. Edita `/server/index.js`
2. Busca la sección `// DATOS DE RESPALDO`
3. Actualiza el array `worldsMatches` con nuevos partidos
4. Reinicia el servidor: `docker-compose restart server`

### Ejemplo de partido:
```javascript
{
  id: 'worlds-2025-X',
  status: 'upcoming',
  startTime: '2025-10-20T18:00:00Z',
  teams: [
    { 
      name: 'FlyQuest', 
      code: 'FLY', 
      logo: 'URL_DEL_LOGO', 
      score: 0 
    },
    { 
      name: 'Equipo Rival', 
      code: 'RIV', 
      logo: 'URL_DEL_LOGO', 
      score: 0 
    }
  ],
  format: 'Bo5',
  league: 'Worlds 2025 - Semifinals'
}
```

---

## 📈 Mejoras futuras sugeridas

- [ ] WebSocket para actualizaciones en tiempo real
- [ ] Notificaciones push cuando empieza un partido
- [ ] Cache de Redis para reducir llamadas a API
- [ ] Base de datos para histórico completo
- [ ] Scraping alternativo si APIs fallan
- [ ] Integración con Twitch para streams en vivo

---

**Última actualización**: 17 de octubre de 2025
