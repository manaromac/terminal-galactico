/**
 * Manejador del Estado del Sistema (Métricas y Barras de Energía/Escudos)
 */

// Seleccionamos los textos de porcentaje de las métricas en tu HTML
const metricHeaders = document.querySelectorAll('.metric-header');
const barFills = document.querySelectorAll('.bar-fill');

let energia = 98;
let escudos = 92;
let modoAlerta = false;

// Función para actualizar visualmente la interfaz
function actualizarInterfazUI() {
    if (metricHeaders.length >= 2 && barFills.length >= 2) {
        // Actualizar barra de Energía (índice 0 en tu HTML)
        metricHeaders[0].innerHTML = `<span>⚡ ENERGÍA</span><span>${Math.round(energia)}%</span>`;
        barFills[0].style.width = `${energia}%`;
        
        // Actualizar barra de Escudos (índice 1 en tu HTML)
        metricHeaders[1].innerHTML = `<span>🛡️ ESCUDOS</span><span>${Math.round(escudos)}%</span>`;
        barFills[1].style.width = `${escudos}%`;

        // Si la energía baja demasiado, cambia el color a naranja de advertencia
        barFills[0].style.backgroundColor = energia < 85 ? 'var(--neon-orange)' : 'var(--neon-blue)';
    }
}

export function initSystemStats() {
    actualizarInterfazUI();

    // 1. Simulación de fluctuación básica de fondo (pequeños cambios aleatorios)
    setInterval(() => {
        if (!modoAlerta) {
            // Fluctuación normal de décimas de porcentaje
            energia += (Math.random() - 0.5) * 0.4;
            escudos += (Math.random() - 0.5) * 0.2;
            
            // Forzar límites máximos
            if (energia > 100) energia = 100;
            if (escudos > 100) escudos = 100;
            
            actualizarInterfazUI();
        }
    }, 3000);

    // 2. Evento: Avistamiento inicial (Los escudos se tensan y consumen un poco)
    window.addEventListener('radar-avistamiento', () => {
        modoAlerta = true;
        energia -= 2; // Gasto por activar sensores pesados
        escudos -= 1; 
        actualizarInterfazUI();
    });

    // 3. Evento: Escaneo en curso (Gran drenaje de energía por el uso de los Canvas y sensores)
    window.addEventListener('radar-escaneo', () => {
        // Simulamos un drenaje continuo durante el escaneo
        const drenajeEscaneo = setInterval(() => {
            if (energia > 75) {
                energia -= 0.8;
                actualizarInterfazUI();
            }
        }, 200);

        // Detener el drenaje cuando se identifique la nave
        window.addEventListener('radar-identificacion', () => {
            clearInterval(drenajeEscaneo);
        }, { once: true });
    });

    // 4. Evento: Identificación final (El sistema se estabiliza)
    window.addEventListener('radar-identificacion', () => {
        modoAlerta = false;
        // Recuperación lenta del generador principal de la Base Alfa
        const recuperacion = setInterval(() => {
            if (energia < 95) {
                energia += 0.5;
                actualizarInterfazUI();
            } else {
                clearInterval(recuperacion);
            }
        }, 1000);
    });
}
