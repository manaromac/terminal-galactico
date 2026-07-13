 import { initClock, initStatusFluctuations } from './system-stats.js';
import { initRadar } from './radar.js';
import { initLogger } from './logger.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("🛸 Terminal Galáctico: Desplegando subrutinas modulares...");
    
    // Inicializar subsistemas
    initClock();
    initStatusFluctuations();
    initLogger();
    initRadar();
});
