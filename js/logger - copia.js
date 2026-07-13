 /**
 * Manejador de la Bitácora y Comunicaciones de Datos
 */

const logBox = document.getElementById('log-box');
const viewerStatus = document.getElementById('viewer-status');
const shipInfoPanel = document.getElementById('ship-info-panel');
const targetScanner = document.getElementById('target-scanner');

function getTimestamp() {
    const now = new Date();
    return `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
}

export function addLog(text, isAlert = false) {
    if (!logBox) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    if (isAlert) entry.style.color = 'var(--neon-orange)';
    
    entry.innerHTML = `<span class="log-time">${getTimestamp()}</span> ${text}`;
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight; // Auto-scroll hacia abajo
}

export function initLogger() {
    // Carga inicial de protocolos estándar de telecomunicación
    addLog("Sistema operativo cargado en núcleo central.");
    addLog("Enlace con satélites cuánticos: OPERATIVO.");
    addLog("Sondeo automático de espacio profundo: EN CURSO.");

    // Escuchar Evento 1: Avistamiento inicial
    window.addEventListener('radar-avistamiento', () => {
        addLog("¡ANOMALÍA DETECTADA! Sensor de ionización activado.", true);
        if (viewerStatus) {
            viewerStatus.textContent = "⚠ ADVERTENCIA";
            viewerStatus.style.color = "var(--neon-orange)";
            targetScanner.style.borderColor = "var(--neon-orange)";
        }
    });

    // Escuchar Evento 2: Inicio del proceso de Escaneo
    window.addEventListener('radar-escaneo', () => {
        addLog("Iniciando secuencia de telemetría y aislamiento térmico.");
        if (viewerStatus) viewerStatus.textContent = "ESCANEO EN CURSO...";
    });

    // Escuchar Evento 3: Identificación final y volcado de ficha técnica
    window.addEventListener('radar-identificacion', () => {
        addLog("Nave identificada. Transfiriendo paquete de telemetría.", false);
        
        if (viewerStatus) {
            viewerStatus.textContent = "🎯 LOCKED";
            viewerStatus.style.color = "var(--neon-green)";
            targetScanner.style.borderColor = "var(--neon-green)";
        }

        if (shipInfoPanel) {
            shipInfoPanel.innerHTML = `
                <p><strong>NOMBRE:</strong> EXPLORADOR T-7</p>
                <p><strong>CLASE:</strong> EXPLORADOR LIGERO</p>
                <p><strong>AFILIACIÓN:</strong> DESCONOCIDA</p>
                <p><strong>VELOCIDAD:</strong> 1.250 km/s</p>
                <p><strong>RUTA:</strong> DESCONOCIDA</p>
                <p><strong>ESTADO:</strong> ESTABLE (S-1)</p>
            `;
            shipInfoPanel.style.color = "var(--neon-green)";
        }
    });
}
