const gestureDisplay = document.getElementById('gesture-display');
const textoFrase = document.getElementById('texto-frase');
const btnEspacio = document.getElementById('btn-espacio');
const btnBorrar = document.getElementById('btn-borrar');
const btnHablar = document.getElementById('btn-hablar');

let lastGesture = "";
let stableTime = 0;
const REQUIRED_STABLE_TIME = 4; // 4 * 500ms = 2 segundos para confirmarla

async function fetchCurrentGesture() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/current_gesture');
        if (!response.ok) throw new Error("Error en red");

        const data = await response.json();
        const current = data.gesture;

        if (current === "Ninguno" || current === "Detectando letra..." || current === "Detectando...") {
            gestureDisplay.innerText = "Detectando...";
            stableTime = 0;
            lastGesture = "";
            return;
        }

        gestureDisplay.innerText = current;

        // Lógica de tiempo de estabilización
        if (current === lastGesture) {
            stableTime++;
            if (stableTime === REQUIRED_STABLE_TIME) {
                // Añadir la letra detectada al textarea
                textoFrase.value += current;
                // Efecto visual para confirmar
                textoFrase.classList.add("bg-indigo-50", "border-indigo-500");
                setTimeout(() => textoFrase.classList.remove("bg-indigo-50", "border-indigo-500"), 400);
            }
        } else {
            stableTime = 1;
        }

        lastGesture = current;

    } catch (error) {
        console.error("Error obteniendo gesto:", error);
        gestureDisplay.innerText = "Desconectado";
    }
}

setInterval(fetchCurrentGesture, 500);

async function setMode(mode) {
    try {
        await fetch('http://127.0.0.1:5000/api/set_mode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: mode })
        });
    } catch (error) {
        console.error("Error configurando el modo:", error);
    }
}

// Eventos de Botones
btnEspacio.addEventListener('click', () => {
    textoFrase.value += " ";
});

btnBorrar.addEventListener('click', () => {
    textoFrase.value = textoFrase.value.slice(0, -1);
});

btnHablar.addEventListener('click', () => {
    const text = textoFrase.value.trim();
    if (text === "") return;
    
    // Usar Web Speech API
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES'; // Acento en español
    window.speechSynthesis.speak(utterance);
    
    // Animación del botón
    btnHablar.classList.add("bg-green-600");
    btnHablar.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm12-3c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z" /></svg>
        Hablando...
    `;
    
    utterance.onend = () => {
        btnHablar.classList.remove("bg-green-600");
        btnHablar.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h3l4 4V4L10 8H7a2 2 0 00-2 2z" /></svg>
            Hablar Frase
        `;
    };
});
