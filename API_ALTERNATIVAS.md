# 🔍 APIs Alternativas para FlyQuest - Comparativa

## 🏆 MEJOR OPCIÓN: Riot Games API (Oficial)

### ✅ **Riot Games Developer API**
- **URL**: https://developer.riotgames.com/
- **Precio**: 💰 **100% GRATIS**
- **Registro**: Cuenta gratuita de Riot
- **Datos**: ✅ **Oficiales y completos**
- **FlyQuest**: ✅ **SÍ está disponible**

#### Ventajas:
- ✅ Datos **directos de Riot Games** (fuente oficial)
- ✅ **Actualizaciones en tiempo real**
- ✅ Incluye **TODOS los equipos profesionales**
- ✅ Partidos de LCS, Worlds, MSI, etc.
- ✅ Estadísticas detalladas de jugadores
- ✅ 100% gratis para uso personal/desarrollo
- ✅ Rate limit: 20 requests/segundo (más que suficiente)

#### Cómo obtener tu API Key:
```bash
1. Ve a: https://developer.riotgames.com/
2. Sign In con tu cuenta de Riot/League of Legends
3. Dashboard → "Register Product"
4. Obtén tu Development API Key (expira cada 24h)
5. O solicita Production API Key (permanente, aprobación en 1-2 días)
```

#### Endpoints relevantes:
```
# Obtener información de equipos profesionales
https://esports-api.lolesports.com/persisted/gw/getTeams

# Obtener partidos (schedule)
https://esports-api.lolesports.com/persisted/gw/getSchedule

# Obtener detalles de un partido específico
https://esports-api.lolesports.com/persisted/gw/getEventDetails

# Obtener ligas
https://esports-api.lolesports.com/persisted/gw/getLeagues
```

---

## 🥈 OPCIÓN 2: LoL Esports API (No oficial pero confiable)

### **Unofficial LoL Esports API**
- **URL**: https://vickz84259.github.io/lolesports-api-docs/
- **Precio**: 💰 **GRATIS** (sin necesidad de API key)
- **Datos**: Scraping de lolesports.com
- **FlyQuest**: ✅ **SÍ está disponible**

#### Ventajas:
- ✅ No requiere autenticación
- ✅ Datos actualizados de lolesports.com
- ✅ Muy fácil de usar
- ✅ Incluye todos los equipos profesionales

#### Endpoints:
```
# Obtener equipos
https://esports-api.lolesports.com/persisted/gw/getTeams?hl=en-US

# Schedule de partidos
https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US&leagueId=...

# Live matches
https://esports-api.lolesports.com/persisted/gw/getLive?hl=en-US
```

---

## 🥉 OPCIÓN 3: Leaguepedia API

### **Leaguepedia (Gamepedia) API**
- **URL**: https://lol.fandom.com/wiki/Help:API_Documentation
- **Precio**: 💰 **GRATIS**
- **Datos**: Wiki colaborativa con datos históricos
- **FlyQuest**: ✅ **SÍ está disponible**

#### Ventajas:
- ✅ Datos históricos muy completos
- ✅ Incluye estadísticas antiguas
- ✅ MediaWiki API (estándar)

#### Desventajas:
- ⚠️ Más complejo de usar
- ⚠️ No tan actualizado en tiempo real

---

## 📊 COMPARATIVA RÁPIDA

| API | Gratis | FlyQuest | Tiempo Real | Fácil de Usar | Recomendación |
|-----|--------|----------|-------------|---------------|---------------|
| **Riot Games** | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ | 🏆 **MEJOR** |
| **LoL Esports** | ✅ | ✅ | ✅ | ⭐⭐⭐⭐ | 🥈 Excelente |
| **Leaguepedia** | ✅ | ✅ | ⚠️ | ⭐⭐⭐ | 🥉 Buena |
| **PandaScore** | ✅ | ❌ | ✅ | ⭐⭐⭐⭐ | ❌ No sirve |

---

## 🚀 IMPLEMENTACIÓN RECOMENDADA

### Opción A: Riot Games API (Más profesional)

**Paso 1: Obtener API Key**
```bash
# Ve a https://developer.riotgames.com/
# Regístrate y obtén tu Development Key
```

**Paso 2: Modificar tu código**
```javascript
// En server/index.js
const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Endpoint para obtener equipos
const teamsResponse = await fetch(
  'https://esports-api.lolesports.com/persisted/gw/getTeams?hl=en-US',
  {
    headers: {
      'x-api-key': RIOT_API_KEY
    }
  }
);
```

### Opción B: LoL Esports API (Más fácil, sin API key)

**Ventaja: NO necesita API key, funciona inmediatamente**

```javascript
// Obtener schedule de partidos
const scheduleResponse = await fetch(
  'https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US',
  {
    headers: {
      'x-api-key': '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z'
      // API key pública de lolesports.com
    }
  }
);
```

---

## 💡 MI RECOMENDACIÓN PARA TI

### **Usa LoL Esports API (Opción B)**

**Por qué:**
1. ✅ **No necesitas registrarte** - funciona inmediatamente
2. ✅ **FlyQuest está disponible** con todos sus datos
3. ✅ **Datos oficiales** directos de lolesports.com
4. ✅ **Actualizaciones en tiempo real**
5. ✅ **Más fácil de implementar** (5 minutos)

**Endpoints que necesitas:**
```javascript
// 1. Obtener información de FlyQuest
const TEAM_SLUG = 'flyquest'; // slug de FlyQuest

// 2. Obtener schedule de partidos
const API_URL = 'https://esports-api.lolesports.com/persisted/gw/getSchedule';
const params = {
  hl: 'en-US',
  pageIndex: 0
};

// 3. Filtrar partidos de FlyQuest
const flyquestMatches = data.events.filter(event => 
  event.match.teams.some(team => team.slug === 'flyquest')
);
```

---

## 🛠️ ¿Quieres que implemente la nueva API ahora?

Puedo cambiar tu código para usar **LoL Esports API** en 5 minutos:
- ✅ Sin necesidad de nuevo API key
- ✅ FlyQuest funcionará inmediatamente
- ✅ Datos en tiempo real de lolesports.com
- ✅ Formato compatible con tu frontend actual

**¿Procedo con la implementación de LoL Esports API?** 🚀
