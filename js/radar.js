/**
 * Motor del Radar Táctico de Espacio Profundo (Versión Octógono Nativo - Corregido)
 */

export function initRadar() {
    const canvas = document.getElementById('radarCanvas');
    if (!canvas) return;
    
    // Forzar tamaño nativo en atributos del Canvas para evitar fallos de renderizado
    canvas.width = 460;
    canvas.height = 460;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Configuración del Sistema Solar de la Base
    const planets = [
        { radius: 5,  orbit: 45,  speed: 0.012, angle: 0, color: '#8a9ba8' },
        { radius: 9,  orbit: 75,  speed: 0.007, angle: 1.2, color: '#4ba3e3' },
        { radius: 12, orbit: 115, speed: 0.004, angle: 3.4, color: '#ff7675' },
        { radius: 18, orbit: 175, speed: 0.002, angle: 2.1, color: '#fdcb6e' },
        { radius: 11, orbit: 215, speed: 0.001, angle: 5.0, color: '#00cec9' }
    ];

    let sweepAngle = 0;
    let scanState = 'SEARCHING'; // SEARCHING, LOCKING, SCANNING, IDENTIFIED
    
    let ship = {
        orbit: 145,
        angle: 4.2,
        speed: 0.002,
        size: 4,
        timer: 0
    };

    function playBeep(frequency = 880, duration = 0.1) {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.type = 'square';
            oscillator.frequency.value = frequency;
            gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + duration);
        } catch (e) {}
    }

    // Función auxiliar para generar la ruta geométrica de un octógono
    function traceOctagon(context, cx, cy, size) {
        context.beginPath();
        for (let i = 0; i < 8; i++) {
            let angle = (i * Math.PI / 4) + Math.PI / 8;
            let x = cx + Math.cos(angle) * size;
            let y = cy + Math.sin(angle) * size;
            if (i === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
        }
        context.closePath();
    }

    function draw() {
        // 1. Limpieza de pantalla para el efecto estela
        ctx.fillStyle = 'rgba(0, 4, 10, 0.2)';
        ctx.fillRect(0, 0, width, height);

        // Enmascaramos todo el dibujo dentro de los límites del octógono
        ctx.save();
        traceOctagon(ctx, centerX, centerY, width / 2 - 4);
        ctx.clip(); 

        // 2. Cuadrícula de radar (Anillos concéntricos de fondo)
        ctx.strokeStyle = 'rgba(0, 210, 255, 0.06)';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 4; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (width / 2) * (i / 4), 0, Math.PI * 2);
            ctx.stroke();
        }

        // 3. Renderizar Órbitas y Planetas
        planets.forEach(p => {
            ctx.beginPath();
            ctx.arc(centerX, centerY, p.orbit, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 210, 255, 0.03)';
            ctx.stroke();

            p.angle += p.speed;
            const px = centerX + Math.cos(p.angle) * p.orbit;
            const py = centerY + Math.sin(p.angle) * p.orbit;

            ctx.beginPath();
            ctx.arc(px, py, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });

        // Sol Central
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#00d2ff';
        ctx.fill();

        // Coordenadas del intruso
        const targetX = centerX + Math.cos(ship.angle) * ship.orbit;
        const targetY = centerY + Math.sin(ship.angle) * ship.orbit;

        // 4. Mecánica del barrido en cruz
        if (scanState === 'SEARCHING') {
            sweepAngle += 0.025;
            ctx.strokeStyle = 'rgba(0, 210, 255, 0.35)';
            ctx.lineWidth = 1.5;
            
            // CORREGIDO: setLineDash es un método, no una propiedad con asignación directa
            ctx.setLineDash([4, 4]); 
            
            ctx.beginPath();
            let d1X = Math.cos(sweepAngle) * width;
            let d1Y = Math.sin(sweepAngle) * height;
            
            ctx.moveTo(centerX - d1X, centerY - d1Y);
            ctx.lineTo(centerX + d1X, centerY + d1Y);
            ctx.moveTo(centerX + d1Y, centerY - d1X);
            ctx.lineTo(centerX - d1Y, centerY + d1X);
            ctx.stroke();
            
            // Restauramos la línea continua para los demás elementos
            ctx.setLineDash([]); 

            ship.timer++;
            if (ship.timer > 200) { 
                scanState = 'LOCKING';
                playBeep(440, 0.3);
                window.dispatchEvent(new CustomEvent('radar-avistamiento'));
            }

        } else if (scanState === 'LOCKING') {
            ctx.strokeStyle = 'var(--neon-orange)';
            ctx.lineWidth = 1.5;
            
            ctx.beginPath();
            ctx.moveTo(0, targetY); ctx.lineTo(width, targetY);
            ctx.moveTo(targetX, 0); ctx.lineTo(targetX, height);
            ctx.stroke();

            ship.timer++;
            if (ship.timer > 320) {
                scanState = 'SCANNING';
                playBeep(580, 0.15);
                window.dispatchEvent(new CustomEvent('radar-escaneo'));
            }

        } else if (scanState === 'SCANNING') {
            ctx.strokeStyle = 'var(--neon-orange)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(targetX - 12, targetY - 12, 24, 24);
            
            ctx.fillStyle = 'var(--neon-orange)';
            ctx.font = '10px Share Tech Mono';
            ctx.fillText("ESCANEO DE CORAZÓN DE ENERGÍA...", targetX + 16, targetY + 4);

            ship.timer++;
            if (ship.timer > 500) {
                scanState = 'IDENTIFIED';
                ship.size = 8;
                playBeep(880, 0.4);
                window.dispatchEvent(new CustomEvent('radar-identificacion'));
            }
        } else if (scanState === 'IDENTIFIED') {
            ctx.strokeStyle = 'var(--neon-green)';
            ctx.lineWidth = 2;
            ctx.strokeRect(targetX - 16, targetY - 16, 32, 32);
            
            ctx.fillStyle = 'var(--neon-green)';
            ctx.font = '10px Share Tech Mono';
            ctx.fillText("ALINEACIÓN COMPLETADA: ENTRADA T-7", targetX + 20, targetY + 4);
        }

        // Renderizar Nave
        if (ship.timer > 100) {
            ship.angle += ship.speed;
            ctx.save();
            ctx.translate(targetX, targetY);
            ctx.fillStyle = scanState === 'IDENTIFIED' ? 'var(--neon-green)' : 'var(--neon-orange)';
            ctx.beginPath();
            ctx.moveTo(0, -ship.size);
            ctx.lineTo(ship.size, 0);
            ctx.lineTo(0, ship.size);
            ctx.lineTo(-ship.size, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Restauramos la máscara para poder pintar el borde exterior sin recortes
        ctx.restore();

        // 5. Pintar el marco perimetral del Octógono (Línea de contorno azul cian)
        traceOctagon(ctx, centerX, centerY, width / 2 - 4);
        ctx.strokeStyle = '#00d2ff'; // Usamos el color cian hexadecimal directamente por si acaso
        ctx.lineWidth = 3;
        ctx.stroke();
        
        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
}