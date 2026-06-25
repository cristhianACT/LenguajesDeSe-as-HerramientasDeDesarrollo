document.addEventListener('DOMContentLoaded', () => {
    // Tabs
    const tabs = ['aprender', 'practicar', 'reto', 'estadisticas'];
    tabs.forEach(tab => {
        document.getElementById(`tab-${tab}`).addEventListener('click', () => {
            tabs.forEach(t => {
                document.getElementById(`seccion-${t}`).classList.add('hidden');
                document.getElementById(`seccion-${t}`).classList.remove('flex');
                document.getElementById(`tab-${t}`).classList.remove('text-indigo-600', 'border-b-2', 'border-indigo-600');
                document.getElementById(`tab-${t}`).classList.add('text-gray-500');
            });
            document.getElementById(`seccion-${tab}`).classList.remove('hidden');
            document.getElementById(`seccion-${tab}`).classList.add('flex');
            document.getElementById(`tab-${tab}`).classList.add('text-indigo-600', 'border-b-2', 'border-indigo-600');
            document.getElementById(`tab-${tab}`).classList.remove('text-gray-500');
        });
    });

    // Estado global
    let state = {
        aciertos: 0,
        errores: 0,
        totalIntentos: 0,
        historial: [],
        conteoNumeros: {},
        totalDetectados: 0,
        practicasRealizadas: 0,

        // Práctica
        numeroActual: null,
        practicaActiva: false,

        // Reto
        retoActivo: false,
        retoSecuencia: [],
        retoPaso: 0,
        retoTiempoInicio: 0,
        retoTimer: null,
        retoAciertos: 0
    };

    // DOM Elements
    const btnNuevoNumero = document.getElementById('btn-nuevo-numero');
    const numeroSolicitado = document.getElementById('numero-solicitado');
    const resultadoPractica = document.getElementById('resultado-practica');
    const contadorAciertos = document.getElementById('contador-aciertos');
    const contadorErrores = document.getElementById('contador-errores');
    const textoProgreso = document.getElementById('texto-progreso');
    const barraProgreso = document.getElementById('barra-progreso');
    const historialLista = document.getElementById('historial-lista');

    // Stats
    const statMasDetectado = document.getElementById('stat-mas-detectado');
    const statTotalDetectados = document.getElementById('stat-total-detectados');
    const statTotalPracticas = document.getElementById('stat-total-practicas');

    // Reto elements
    const btnIniciarReto = document.getElementById('btn-iniciar-reto');
    const btnReintentarReto = document.getElementById('btn-reintentar-reto');
    const retoSetup = document.getElementById('reto-setup');
    const retoActivoCont = document.getElementById('reto-activo');
    const retoResultados = document.getElementById('reto-resultados');
    const retoTiempo = document.getElementById('reto-tiempo');
    const retoPaso = document.getElementById('reto-paso');
    const retoSecuenciaCont = document.getElementById('reto-secuencia');

    // Funciones Helper
    const getRandomNumber = () => Math.floor(Math.random() * 11).toString();

    const actualizarProgreso = () => {
        if (state.totalIntentos === 0) return;
        const porcentaje = Math.round((state.aciertos / state.totalIntentos) * 100);
        textoProgreso.innerText = `${porcentaje}%`;
        barraProgreso.style.width = `${porcentaje}%`;
    };

    const actualizarEstadisticas = (num) => {
        state.totalDetectados++;
        state.conteoNumeros[num] = (state.conteoNumeros[num] || 0) + 1;

        statTotalDetectados.innerText = state.totalDetectados;

        // Calcular más detectado
        let maxNum = '-';
        let maxCount = 0;
        for (let n in state.conteoNumeros) {
            if (state.conteoNumeros[n] > maxCount) {
                maxCount = state.conteoNumeros[n];
                maxNum = n;
            }
        }
        statMasDetectado.innerText = maxNum;

        // Historial
        // No añadir duplicados consecutivos
        if (state.historial.length === 0 || state.historial[0] !== num) {
            state.historial.unshift(num);
            if (state.historial.length > 10) state.historial.pop();

            historialLista.innerHTML = state.historial.map(n => `
                <li class="p-3 text-sm font-bold text-gray-700 border-b border-gray-100 flex justify-between">
                    <span>Número detectado:</span>
                    <span class="text-indigo-600 text-lg">${n}</span>
                </li>
            `).join('');
        }
    };

    const iniciarPractica = () => {
        state.numeroActual = getRandomNumber();
        numeroSolicitado.innerText = state.numeroActual;
        resultadoPractica.innerText = '';
        resultadoPractica.className = 'h-8 text-lg font-bold';
        state.practicaActiva = true;
    };

    btnNuevoNumero.addEventListener('click', iniciarPractica);

    // Reto logic
    const renderSecuencia = () => {
        retoSecuenciaCont.innerHTML = state.retoSecuencia.map((n, i) => {
            let color = 'bg-white text-gray-400 border-gray-200';
            if (i < state.retoPaso) color = 'bg-green-100 text-green-700 border-green-300';
            else if (i === state.retoPaso) color = 'bg-indigo-100 text-indigo-700 border-indigo-300 font-bold scale-110';
            return `<div class="w-10 h-10 flex items-center justify-center rounded-lg border-2 ${color} transition-all">${n}</div>`;
        }).join('<span class="flex items-center text-gray-300">→</span>').replace(/<span class="flex items-center text-gray-300">→<\/span>$/, '');
    };

    const iniciarReto = () => {
        retoSetup.classList.add('hidden');
        retoResultados.classList.remove('flex');
        retoResultados.classList.add('hidden');
        retoActivoCont.classList.remove('hidden');
        retoActivoCont.classList.add('flex');

        state.retoSecuencia = Array.from({ length: 5 }, getRandomNumber);
        state.retoPaso = 0;
        state.retoAciertos = 0;
        state.retoTiempoInicio = Date.now();
        state.retoActivo = true;

        if (state.retoTimer) clearInterval(state.retoTimer);
        state.retoTimer = setInterval(() => {
            const segundos = Math.floor((Date.now() - state.retoTiempoInicio) / 1000);
            retoTiempo.innerText = `${segundos}s`;
        }, 1000);

        retoPaso.innerText = `1/5`;
        renderSecuencia();
    };

    btnIniciarReto.addEventListener('click', iniciarReto);
    btnReintentarReto.addEventListener('click', iniciarReto);

    const finalizarReto = () => {
        state.retoActivo = false;
        clearInterval(state.retoTimer);
        retoActivoCont.classList.remove('flex');
        retoActivoCont.classList.add('hidden');
        retoResultados.classList.remove('hidden');
        retoResultados.classList.add('flex');

        const segundos = Math.floor((Date.now() - state.retoTiempoInicio) / 1000);
        document.getElementById('res-tiempo').innerText = `${segundos}s`;
        document.getElementById('res-aciertos').innerText = state.retoAciertos;

        const puntaje = Math.max(0, (state.retoAciertos * 200) - (segundos * 5));
        document.getElementById('res-puntaje').innerText = puntaje;
    };

    // Observer para la detección
    const gestureDisplay = document.getElementById('gesture-display');
    let lastDetectedTime = 0;

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const detected = gestureDisplay.innerText;
                // Exclude invalid states
                if (detected !== "..." && detected !== "Detectando..." && detected !== "Ninguno" && detected !== "Detectando número...") {

                    const now = Date.now();
                    if (now - lastDetectedTime < 1500) return; // Debounce
                    lastDetectedTime = now;

                    actualizarEstadisticas(detected);

                    // Modo Práctica
                    if (state.practicaActiva && document.getElementById('seccion-practicar').classList.contains('flex')) {
                        state.totalIntentos++;
                        if (detected === state.numeroActual) {
                            resultadoPractica.innerText = '✓ Correcto';
                            resultadoPractica.className = 'h-8 text-lg font-bold text-green-600';
                            state.aciertos++;
                            state.practicasRealizadas++;
                            statTotalPracticas.innerText = state.practicasRealizadas;
                            state.practicaActiva = false; // Espera nuevo número
                            setTimeout(iniciarPractica, 2000); // Auto nuevo numero
                        } else {
                            resultadoPractica.innerText = '✗ Incorrecto';
                            resultadoPractica.className = 'h-8 text-lg font-bold text-red-600';
                            state.errores++;
                        }

                        contadorAciertos.innerText = state.aciertos;
                        contadorErrores.innerText = state.errores;
                        actualizarProgreso();
                    }

                    // Modo Reto
                    if (state.retoActivo && document.getElementById('seccion-reto').classList.contains('flex')) {
                        const target = state.retoSecuencia[state.retoPaso];
                        if (detected === target) {
                            state.retoAciertos++;
                            state.retoPaso++;
                            if (state.retoPaso >= 5) {
                                renderSecuencia();
                                setTimeout(finalizarReto, 500);
                            } else {
                                retoPaso.innerText = `${state.retoPaso + 1}/5`;
                                renderSecuencia();
                            }
                        }
                    }
                }
            }
        });
    });

    if (gestureDisplay) {
        observer.observe(gestureDisplay, { childList: true, subtree: true, characterData: true });
    }

    // Init
    iniciarPractica();
});
