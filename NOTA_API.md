# 🔧 NOTA TÉCNICA: API DE RIOT GAMES

## Estado actual de la API

La API pública de LoL Esports (https://esports-api.lolesports.com) ha implementado restricciones de acceso que devuelven error 403 Forbidden.

## Solución implementada

El servidor ahora tiene un **sistema de fallback** que funciona de la siguiente manera:

1. **Intenta conectar** a la API oficial de LoL Esports
2. **Si falla** (403, timeout, etc.), **automáticamente cambia a datos de demostración**
3. Los datos de demostración incluyen:
   - Partidos recientes de FlyQuest
   - Partidos próximos
   - Partidos en progreso
   - Logos actualizados de todos los equipos

## Para usar datos reales

Si tienes acceso a la API de Riot Games o quieres usar otra fuente de datos:

### Opción 1: API Key oficial de Riot
```javascript
// En server/index.js, línea ~33
headers: {
  'x-api-key': 'TU_API_KEY_AQUI',
  'User-Agent': 'TuAplicacion/1.0'
}
```

### Opción 2: Scraping alternativo
Puedes implementar un scraper de:
- https://lolesports.com/schedule
- https://lol.fandom.com/wiki/LCS
- APIs de terceros como PandaScore

### Opción 3: Base de datos propia
Actualiza manualmente un JSON con los partidos:
```bash
# Crear archivo con partidos reales
echo '[...]' > server/data/matches.json
```

## Ventajas del sistema actual

✅ **La aplicación siempre funciona** incluso sin API
✅ **Perfecta para desarrollo y demos**
✅ **Fácil de customizar** los datos de ejemplo
✅ **No depende de servicios externos**

## Limitaciones

⚠️ Los datos de demostración no se actualizan automáticamente
⚠️ Los resultados son ficticios
⚠️ No hay datos históricos reales

---

**Última actualización**: 17 de octubre de 2025
