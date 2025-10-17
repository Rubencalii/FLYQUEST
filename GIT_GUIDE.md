# 🚀 Guía Rápida - Git y Subida a GitHub

## 📦 Preparar Proyecto para GitHub

### 1. Crear .gitignore

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
**/node_modules/

# Production builds
dist/
build/
frontend/dist/

# Environment variables
.env
.env.local
.env.production

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Docker
*.bak
data/bugs.json.bak
data/*.tmp

# Testing
coverage/
.nyc_output/

# Misc
.cache/
EOF
```

### 2. Inicializar Git

```bash
# Inicializar repositorio (si no existe)
git init

# Añadir todos los archivos
git add .

# Primer commit
git commit -m "🎮 Initial commit - FlyQuest Dashboard v2.0

- Backend con API real de Riot (9 ligas)
- Frontend React + Vite + TailwindCSS
- Scripts de automatización (start, dev, stop, check, status)
- Documentación completa
- Sin datos de respaldo hardcodeados
- Listo para producción"
```

### 3. Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre: `flyquest-dashboard`
3. Descripción: `🎮 Dashboard de esports para FlyQuest - React + Node.js + Riot Games API`
4. Público o Privado (tú decides)
5. **NO** marcar "Initialize with README" (ya lo tenemos)
6. Crear repositorio

### 4. Conectar y Subir

```bash
# Añadir remote (reemplaza TU-USUARIO)
git remote add origin https://github.com/TU-USUARIO/flyquest-dashboard.git

# Verificar remote
git remote -v

# Subir código
git push -u origin main

# Si el branch se llama master:
# git branch -M main
# git push -u origin main
```

### 5. Configurar GitHub Pages (Opcional)

Si quieres una demo pública del frontend:

```bash
# 1. En GitHub: Settings → Pages
# 2. Source: GitHub Actions
# 3. Crear .github/workflows/deploy.yml (ver abajo)
```

---

## 🔄 Workflow Diario

### Después de hacer cambios:

```bash
# Ver qué cambió
git status

# Añadir archivos modificados
git add .
# O archivos específicos:
# git add server/index.js frontend/src/components/

# Commit con mensaje descriptivo
git commit -m "✨ Agregar nuevo feature X"

# Subir a GitHub
git push
```

### Tipos de commits sugeridos:

```bash
git commit -m "✨ Nuevo feature"      # Nueva funcionalidad
git commit -m "🐛 Fix bug en X"       # Corrección de bug
git commit -m "📝 Actualizar docs"    # Documentación
git commit -m "🎨 Mejorar UI"         # Mejoras visuales
git commit -m "♻️ Refactor código"    # Refactorización
git commit -m "⚡ Optimizar X"        # Mejoras de rendimiento
git commit -m "🔒 Seguridad"          # Mejoras de seguridad
git commit -m "🚀 Deploy"             # Despliegue
```

---

## 🌿 Ramas (Branches)

### Crear rama para nuevo feature:

```bash
# Crear y cambiar a nueva rama
git checkout -b feature/nuevo-dashboard

# Hacer cambios y commits
git add .
git commit -m "✨ Agregar nuevo dashboard"

# Subir rama a GitHub
git push -u origin feature/nuevo-dashboard

# En GitHub: crear Pull Request

# Volver a main
git checkout main

# Actualizar main con los cambios mergeados
git pull
```

---

## 🔧 GitHub Actions - CI/CD

### Crear archivo de workflow

```bash
mkdir -p .github/workflows

cat > .github/workflows/ci.yml << 'EOF'
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd server && npm install
        cd ../frontend && npm install
    
    - name: Check for errors
      run: |
        cd server && npm run lint || true
        cd ../frontend && npm run build

  docker:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker images
      run: docker-compose build
    
    - name: Test Docker containers
      run: |
        docker-compose up -d
        sleep 10
        curl -f http://localhost:4001/api/flyquest/matches || exit 1
        docker-compose down
EOF

git add .github/workflows/ci.yml
git commit -m "🚀 Agregar CI/CD con GitHub Actions"
git push
```

---

## 📋 README para GitHub

Tu README.md actual ya está bien, pero asegúrate de incluir:

### Badges (Opcional)

```markdown
# 🎮 FlyQuest Dashboard

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![Docker](https://img.shields.io/badge/Docker-ready-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

[Resto del README...]
```

---

## 🔐 Secrets en GitHub

Para despliegues automáticos con API Key:

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. New repository secret
4. Nombre: `RIOT_API_KEY`
5. Valor: `RGAPI-tu-key-aqui`

Luego puedes usar en workflows:
```yaml
- name: Deploy
  env:
    RIOT_API_KEY: ${{ secrets.RIOT_API_KEY }}
```

---

## 📦 Release

### Crear una release:

```bash
# Crear tag
git tag -a v2.0.0 -m "Release v2.0.0 - API real sin respaldo"

# Subir tag
git push origin v2.0.0

# En GitHub:
# 1. Ir a Releases
# 2. Create a new release
# 3. Seleccionar tag v2.0.0
# 4. Título: "v2.0.0 - API Real Integration"
# 5. Descripción: changelog
# 6. Publish release
```

---

## 🚀 Comandos Rápidos Completos

```bash
# Setup completo inicial
git init
git add .
git commit -m "🎮 Initial commit - FlyQuest Dashboard"
git remote add origin https://github.com/TU-USUARIO/flyquest-dashboard.git
git push -u origin main

# Día a día
git add .
git commit -m "✨ Tu mensaje aquí"
git push

# Actualizar desde GitHub
git pull

# Ver historial
git log --oneline --graph --all
```

---

## 📌 Notas Importantes

1. **Nunca** subas el archivo `.env` con API keys
2. **Siempre** usa `.gitignore` para excluir archivos sensibles
3. **Commits frecuentes** con mensajes descriptivos
4. **Pull antes de Push** si trabajas en equipo
5. **README.md actualizado** siempre

---

## ✅ Checklist antes de subir

- [ ] `.gitignore` configurado
- [ ] Sin archivos `.env` en el repositorio
- [ ] `README.md` completo y actualizado
- [ ] Código sin errores (`npm run build`)
- [ ] Documentación completa
- [ ] Scripts de automatización funcionando
- [ ] Archivos innecesarios eliminados
- [ ] Commits con mensajes descriptivos

---

¡Listo para subir a GitHub! 🚀
