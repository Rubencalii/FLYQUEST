# 📊 Guía Completa de Chart.js v4.5.1 - FlyQuest Dashboard

## 📚 Documentación Oficial
- **Chart.js Docs**: https://www.chartjs.org/docs/latest/
- **React-ChartJS-2**: https://react-chartjs-2.js.org/
- **Ejemplos**: https://www.chartjs.org/docs/latest/samples/

---

## 🎯 ¿Qué es Chart.js?

Chart.js es una librería JavaScript de código abierto para crear gráficos interactivos y animados en HTML5 Canvas. Es:
- ✅ Ligera (~60KB minificada)
- ✅ Responsive por defecto
- ✅ Soporte para 8 tipos de gráficos
- ✅ Altamente personalizable
- ✅ Animaciones suaves
- ✅ Compatible con TypeScript

---

## 📦 Instalación en FlyQuest

Ya instalado en el proyecto:
```json
{
  "chart.js": "^4.5.1",
  "react-chartjs-2": "^5.3.0"
}
```

---

## 🎨 Tipos de Gráficos Disponibles

### 1. **Line Chart** (Gráfico de Líneas)
**Uso:** Evolución temporal, tendencias

```jsx
import { Line } from 'react-chartjs-2'

const data = {
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
  datasets: [{
    label: 'Winrate',
    data: [55, 60, 58, 65, 70],
    borderColor: '#00a99d',
    backgroundColor: 'rgba(0, 169, 157, 0.1)',
    tension: 0.4,
    fill: true
  }]
}

<Line data={data} options={options} />
```

**Ejemplo en FlyQuest:** StatsBoard.jsx - Evolución de winrate

---

### 2. **Bar Chart** (Gráfico de Barras)
**Uso:** Comparaciones, rankings

```jsx
import { Bar } from 'react-chartjs-2'

const data = {
  labels: ['Worlds', 'LCS', 'MSI'],
  datasets: [{
    label: 'Victorias',
    data: [12, 8, 5],
    backgroundColor: [
      'rgba(0, 169, 157, 0.8)',
      'rgba(0, 242, 234, 0.8)',
      'rgba(74, 222, 128, 0.8)'
    ]
  }]
}

<Bar data={data} options={options} />
```

**Ejemplo en FlyQuest:** StatsBoard.jsx - Rendimiento por torneo

---

### 3. **Doughnut Chart** (Gráfico Circular)
**Uso:** Distribución, porcentajes

```jsx
import { Doughnut } from 'react-chartjs-2'

const data = {
  labels: ['Victorias', 'Derrotas'],
  datasets: [{
    data: [65, 35],
    backgroundColor: ['#00a99d', '#ef4444'],
    borderWidth: 2,
    borderColor: '#1a1a1a'
  }]
}

<Doughnut data={data} options={options} />
```

**Ejemplo en FlyQuest:** StatsBoard.jsx - Distribución de W/L

---

### 4. **Pie Chart** (Gráfico de Pastel)
Similar al Doughnut pero sin hueco central

```jsx
import { Pie } from 'react-chartjs-2'
```

---

### 5. **Radar Chart** (Gráfico de Radar)
**Uso:** Comparación multidimensional

```jsx
import { Radar } from 'react-chartjs-2'

const data = {
  labels: ['Early', 'Mid', 'Late', 'Team Fight', 'Objective'],
  datasets: [{
    label: 'FlyQuest',
    data: [8, 7, 9, 8, 9],
    borderColor: '#00a99d',
    backgroundColor: 'rgba(0, 169, 157, 0.2)'
  }]
}
```

**Uso potencial:** Análisis de fortalezas del equipo

---

### 6. **Polar Area Chart**
Similar al radar pero con datos radiales

```jsx
import { PolarArea } from 'react-chartjs-2'
```

---

### 7. **Bubble Chart** (Gráfico de Burbujas)
**Uso:** 3 dimensiones de datos (x, y, tamaño)

```jsx
import { Bubble } from 'react-chartjs-2'

const data = {
  datasets: [{
    label: 'Jugadores',
    data: [
      { x: 4.5, y: 65, r: 15 }, // KDA, Winrate, Juegos
      { x: 3.8, y: 58, r: 12 }
    ]
  }]
}
```

---

### 8. **Scatter Chart** (Gráfico de Dispersión)
**Uso:** Correlaciones, patrones

```jsx
import { Scatter } from 'react-chartjs-2'
```

---

## ⚙️ Configuración Global

### Registro de Componentes

```jsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)
```

**Necesario antes de usar cualquier gráfico.**

---

## 🎨 Opciones Comunes

### Responsive y Aspect Ratio

```jsx
const options = {
  responsive: true,
  maintainAspectRatio: false, // Permite altura fija
  aspectRatio: 2 // Ratio por defecto 2:1
}
```

---

### Personalizar Tooltips

```jsx
const options = {
  plugins: {
    tooltip: {
      backgroundColor: '#1f2937',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#374151',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (context) => {
          return `${context.dataset.label}: ${context.parsed.y}%`
        }
      }
    }
  }
}
```

---

### Leyendas

```jsx
const options = {
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#9ca3af',
        font: {
          size: 14,
          family: 'Inter, system-ui, sans-serif'
        },
        padding: 15,
        usePointStyle: true
      }
    }
  }
}
```

---

### Título del Gráfico

```jsx
const options = {
  plugins: {
    title: {
      display: true,
      text: 'Evolución del Winrate',
      color: '#00a99d',
      font: {
        size: 18,
        weight: 'bold'
      },
      padding: 20
    }
  }
}
```

---

### Configuración de Ejes

```jsx
const options = {
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        color: '#9ca3af',
        callback: (value) => value + '%'
      },
      grid: {
        color: '#374151',
        drawBorder: false
      }
    },
    x: {
      ticks: {
        color: '#9ca3af'
      },
      grid: {
        display: false
      }
    }
  }
}
```

---

## 🎭 Modo Oscuro

### Detección Automática

```jsx
const isDark = document.documentElement.classList.contains('dark')

const options = {
  plugins: {
    legend: {
      labels: {
        color: isDark ? '#ffffff' : '#000000'
      }
    }
  },
  scales: {
    y: {
      ticks: {
        color: isDark ? '#9ca3af' : '#6b7280'
      },
      grid: {
        color: isDark ? '#374151' : '#e5e7eb'
      }
    }
  }
}
```

---

## 🎬 Animaciones

### Configuración Básica

```jsx
const options = {
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart'
  }
}
```

### Animaciones Personalizadas

```jsx
const options = {
  animation: {
    onComplete: () => {
      console.log('Animación completada')
    },
    onProgress: (context) => {
      console.log(`Progreso: ${context.currentStep}/${context.numSteps}`)
    }
  },
  transitions: {
    show: {
      animations: {
        x: { from: 0 },
        y: { from: 0 }
      }
    },
    hide: {
      animations: {
        x: { to: 0 },
        y: { to: 0 }
      }
    }
  }
}
```

---

## 🔧 Plugins Útiles

### 1. **Datalabels Plugin**
Muestra valores en los gráficos

```bash
npm install chartjs-plugin-datalabels
```

```jsx
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(ChartDataLabels)

const options = {
  plugins: {
    datalabels: {
      color: '#fff',
      font: {
        weight: 'bold'
      },
      formatter: (value) => Math.round(value) + '%'
    }
  }
}
```

---

### 2. **Zoom Plugin**
Permite hacer zoom en los gráficos

```bash
npm install chartjs-plugin-zoom
```

```jsx
import zoomPlugin from 'chartjs-plugin-zoom'

ChartJS.register(zoomPlugin)

const options = {
  plugins: {
    zoom: {
      pan: {
        enabled: true,
        mode: 'x'
      },
      zoom: {
        wheel: {
          enabled: true
        },
        pinch: {
          enabled: true
        },
        mode: 'x'
      }
    }
  }
}
```

---

### 3. **Annotation Plugin**
Añade líneas, cajas y etiquetas

```bash
npm install chartjs-plugin-annotation
```

```jsx
import annotationPlugin from 'chartjs-plugin-annotation'

ChartJS.register(annotationPlugin)

const options = {
  plugins: {
    annotation: {
      annotations: {
        line1: {
          type: 'line',
          yMin: 50,
          yMax: 50,
          borderColor: 'red',
          borderWidth: 2,
          label: {
            content: 'Objetivo: 50%',
            enabled: true
          }
        }
      }
    }
  }
}
```

---

## 💡 Mejores Prácticas en FlyQuest

### 1. **useMemo para Datos**
Evita recalcular datos en cada render

```jsx
const chartData = useMemo(() => {
  // Cálculos pesados aquí
  return {
    labels: [...],
    datasets: [...]
  }
}, [matches]) // Solo recalcula si matches cambia
```

---

### 2. **Lazy Loading**
Carga Chart.js solo cuando sea necesario

```jsx
const StatsBoard = lazy(() => import('./StatsBoard'))

<Suspense fallback={<Loading />}>
  <StatsBoard matches={matches} />
</Suspense>
```

---

### 3. **Responsive Container**
Usa contenedores con altura fija

```jsx
<div style={{ height: '400px' }}>
  <Line data={data} options={{ maintainAspectRatio: false }} />
</div>
```

---

### 4. **Colores Consistentes**
Usa la paleta de FlyQuest

```jsx
const colors = {
  primary: '#00a99d',
  secondary: '#00f2ea',
  success: '#4ade80',
  error: '#ef4444',
  dark: '#1a1a1a',
  light: '#f3f4f6'
}
```

---

## 🚀 Ejemplos Avanzados

### Gráfico con Múltiples Datasets

```jsx
const data = {
  labels: ['Ene', 'Feb', 'Mar', 'Abr'],
  datasets: [
    {
      label: 'FlyQuest',
      data: [65, 68, 70, 72],
      borderColor: '#00a99d',
      backgroundColor: 'rgba(0, 169, 157, 0.1)'
    },
    {
      label: 'Promedio LCS',
      data: [55, 56, 58, 57],
      borderColor: '#9ca3af',
      backgroundColor: 'rgba(156, 163, 175, 0.1)',
      borderDash: [5, 5] // Línea discontinua
    }
  ]
}
```

---

### Gráfico Mixto (Line + Bar)

```jsx
const data = {
  labels: ['S1', 'S2', 'S3', 'S4'],
  datasets: [
    {
      type: 'line',
      label: 'Winrate',
      data: [55, 60, 65, 70],
      borderColor: '#00a99d',
      yAxisID: 'y'
    },
    {
      type: 'bar',
      label: 'Partidos',
      data: [20, 25, 22, 18],
      backgroundColor: '#00f2ea',
      yAxisID: 'y1'
    }
  ]
}

const options = {
  scales: {
    y: {
      type: 'linear',
      position: 'left'
    },
    y1: {
      type: 'linear',
      position: 'right',
      grid: {
        drawOnChartArea: false
      }
    }
  }
}
```

---

### Gráfico con Gradientes

```jsx
const createGradient = (ctx, chartArea) => {
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
  gradient.addColorStop(0, 'rgba(0, 169, 157, 0)')
  gradient.addColorStop(1, 'rgba(0, 169, 157, 0.8)')
  return gradient
}

// En el componente
const chartRef = useRef(null)

const data = {
  labels: ['...'],
  datasets: [{
    backgroundColor: (context) => {
      const chart = context.chart
      const {ctx, chartArea} = chart
      if (!chartArea) return 'rgba(0, 169, 157, 0.1)'
      return createGradient(ctx, chartArea)
    }
  }]
}
```

---

## 📱 Optimización Performance

### 1. **Decimation**
Reduce puntos de datos para mejor rendimiento

```jsx
const options = {
  parsing: false,
  normalized: true,
  decimation: {
    enabled: true,
    algorithm: 'lttb',
    samples: 50
  }
}
```

---

### 2. **Animaciones Condicionales**

```jsx
const options = {
  animation: {
    duration: window.innerWidth < 768 ? 0 : 1000 // Sin animación en móvil
  }
}
```

---

## 🎓 Recursos de Aprendizaje

- **Documentación Oficial**: https://www.chartjs.org/docs/latest/
- **Awesome Chart.js**: https://github.com/chartjs/awesome
- **CodePen Ejemplos**: https://codepen.io/tag/chartjs
- **Stack Overflow**: https://stackoverflow.com/questions/tagged/chart.js

---

## 🐛 Troubleshooting Común

### Error: "Canvas is already in use"
**Solución:** Destruye el gráfico anterior antes de crear uno nuevo

```jsx
useEffect(() => {
  return () => {
    const chart = chartRef.current
    if (chart) {
      chart.destroy()
    }
  }
}, [])
```

---

### Gráfico no se actualiza
**Solución:** Crea nuevas instancias de objetos, no mutes los existentes

```jsx
// ❌ Mal
data.datasets[0].data.push(newValue)

// ✅ Bien
setData({
  ...data,
  datasets: data.datasets.map(dataset => ({
    ...dataset,
    data: [...dataset.data, newValue]
  }))
})
```

---

### Responsive no funciona
**Solución:** Asegúrate de que el contenedor tenga tamaño definido

```jsx
<div style={{ position: 'relative', height: '400px', width: '100%' }}>
  <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />
</div>
```

---

## 📝 Notas Finales

- Chart.js v4 tiene breaking changes respecto a v3
- Siempre registra los componentes necesarios
- Usa TypeScript para mejor autocompletado
- Testea en diferentes tamaños de pantalla
- Considera lazy loading para gráficos complejos

---

**¡Éxito con tus gráficos de FlyQuest! 🚀📊**
