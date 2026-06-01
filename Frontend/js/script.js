const el = id => document.getElementById(id);
const gestureDisplay = el('gesture-display');
const connectionStatus = el('connection-status');

const updateStatus = (text, color) => {
    connectionStatus.innerText = text;
    connectionStatus.style.color = color;
};

const fetchCurrentGesture = async () => {
    try {
        const res = await fetch('http://127.0.0.1:5000/api/current_gesture');
        if (!res.ok) throw new Error();

        const { gesture } = await res.json();
        
        if (gesture === "Ninguno") {
            gestureDisplay.innerText = "Detectando...";
        } else if (gesture !== gestureDisplay.innerText) {
            gestureDisplay.innerText = gesture;
            gestureDisplay.style.transform = "scale(1.05)";
            setTimeout(() => gestureDisplay.style.transform = "scale(1)", 200);
        }

        updateStatus("Conectado", "#10b981");
    } catch (e) {
        updateStatus("Desconectado", "#ef4444");
    }
};

setInterval(fetchCurrentGesture, 500);

const setMode = async mode => {
    try {
        await fetch('http://127.0.0.1:5000/api/set_mode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode })
        });
    } catch (e) {
        console.error("Error configurando modo:", e);
    }
};
