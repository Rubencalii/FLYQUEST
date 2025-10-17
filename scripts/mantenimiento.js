// Configuración de la API y elementos del DOM
const API_BASE = '/api/mantenimiento';
const output = document.getElementById('output');
const outputTitle = document.getElementById('output-title');
const lastUpdate = document.getElementById('last-update');
const backendStatus = document.getElementById('backend-status');
const apiStatus = document.getElementById('api-status');

// Función para mostrar mensajes en el panel de salida
function mostrar(titulo, mensaje, tipo = 'info') {
    outputTitle.textContent = titulo;
    output.textContent = mensaje;
    actualizarHora();
    
    // Añadir color según el tipo de mensaje
    output.style.color = tipo === 'error' ? '#ef4444' : 
                         tipo === 'success' ? '#10b981' : 
                         tipo === 'warning' ? '#f59e0b' : '#e2e8f0';
}

// Función para limpiar el panel de salida
function limpiarOutput() {
    output.textContent = 'Selecciona una operación para ver los resultados aquí.';
    outputTitle.textContent = 'Esperando acción...';
    output.style.color = '#e2e8f0';
}

// Actualizar la hora de la última actualización
function actualizarHora() {
    const ahora = new Date();
    lastUpdate.textContent = ahora.toLocaleTimeString('es-ES');
}

// Actualizar estado del backend
async function actualizarEstadoBackend() {
    try {
        const res = await fetch(`${API_BASE}/estado`);
        if (res.ok) {
            backendStatus.textContent = '🟢 Activo';
            backendStatus.style.color = '#10b981';
        } else {
            backendStatus.textContent = '🔴 Error';
            backendStatus.style.color = '#ef4444';
        }
    } catch {
        backendStatus.textContent = '🔴 Inactivo';
        backendStatus.style.color = '#ef4444';
    }
}

// Testear API de PandaScore
async function testApi() {
    mostrar('🔍 Testeando API PandaScore', 'Conectando con la API...');
    try {
        const res = await fetch(`${API_BASE}/test-api`);
        const data = await res.text();
        
        if (data.includes('OK')) {
            mostrar('✅ Test API completado', data, 'success');
            apiStatus.textContent = '🟢 Disponible';
            apiStatus.style.color = '#10b981';
        } else {
            mostrar('⚠️ Test API con advertencias', data, 'warning');
            apiStatus.textContent = '🟡 Parcial';
            apiStatus.style.color = '#f59e0b';
        }
    } catch (err) {
        mostrar('❌ Error en Test API', 'Error al testear API: ' + err.message, 'error');
        apiStatus.textContent = '🔴 No disponible';
        apiStatus.style.color = '#ef4444';
    }
}

// Reiniciar el backend
async function reiniciarBackend() {
    if (!confirm('¿Estás seguro de reiniciar el backend? Esto interrumpirá el servicio temporalmente.')) {
        return;
    }
    
    mostrar('🔄 Reiniciando Backend', 'Enviando comando de reinicio...');
    try {
        const res = await fetch(`${API_BASE}/reiniciar-backend`);
        const data = await res.text();
        mostrar('✅ Backend reiniciado', data, 'success');
        
        // Esperar y actualizar estado
        setTimeout(actualizarEstadoBackend, 3000);
    } catch (err) {
        mostrar('❌ Error al reiniciar', 'Error: ' + err.message, 'error');
    }
}

// Ver logs del sistema
async function verLogs() {
    mostrar('📋 Obteniendo Logs', 'Cargando logs del sistema...');
    try {
        const res = await fetch(`${API_BASE}/logs`);
        const data = await res.text();
        
        if (data && data.trim() !== '') {
            mostrar('📋 Logs del Sistema', data);
        } else {
            mostrar('ℹ️ Sin Logs', 'No hay logs disponibles en este momento.', 'warning');
        }
    } catch (err) {
        mostrar('❌ Error al obtener logs', 'Error: ' + err.message, 'error');
    }
}

// Ver estado de los servicios
async function estadoServicios() {
    mostrar('📊 Consultando Estado', 'Obteniendo información de servicios...');
    try {
        const res = await fetch(`${API_BASE}/estado`);
        const data = await res.text();
        
        // Intentar parsear como JSON para mejor formato
        try {
            const json = JSON.parse(data);
            const formatted = JSON.stringify(json, null, 2);
            mostrar('📊 Estado de Servicios', formatted, 'success');
        } catch {
            mostrar('📊 Estado de Servicios', data, 'success');
        }
        
        actualizarEstadoBackend();
    } catch (err) {
        mostrar('❌ Error al consultar estado', 'Error: ' + err.message, 'error');
    }
}

// Actualizar dependencias
async function actualizarDependencias() {
    if (!confirm('¿Deseas actualizar las dependencias del proyecto? Esto puede tomar varios minutos.')) {
        return;
    }
    
    mostrar('⬆️ Actualizando Dependencias', 'Ejecutando npm install... Por favor espera.');
    try {
        const res = await fetch(`${API_BASE}/actualizar`);
        const data = await res.text();
        
        if (data.includes('up to date') || data.includes('added')) {
            mostrar('✅ Dependencias actualizadas', data, 'success');
        } else {
            mostrar('⚠️ Actualización completada con advertencias', data, 'warning');
        }
    } catch (err) {
        mostrar('❌ Error al actualizar', 'Error: ' + err.message, 'error');
    }
}

// Ver historial de estado de FlyQuest en la API
async function verEstadoFlyQuest() {
    mostrar('📈 Consultando Historial FlyQuest', 'Obteniendo historial de estado...');
    try {
        const res = await fetch(`${API_BASE}/estado-flyquest`);
        const data = await res.text();
        
        if (data && data.trim() !== '' && !data.includes('No hay registros')) {
            mostrar('📈 Historial FlyQuest API (últimas 50 entradas)', data);
        } else {
            mostrar('ℹ️ Sin Historial', 'No hay registros de FlyQuest disponibles aún.\nEl script de monitorización se ejecutará automáticamente.', 'warning');
        }
    } catch (err) {
        mostrar('❌ Error al consultar historial', 'Error: ' + err.message, 'error');
    }
}

// Inicializar: actualizar estado del backend al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    actualizarEstadoBackend();
    actualizarHora();
    
    // Actualizar estado cada 30 segundos
    setInterval(actualizarEstadoBackend, 30000);
});
