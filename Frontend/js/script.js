const gestureDisplay = document.getElementById('gesture-display');
const connectionStatus = document.getElementById('connection-status');

async function fetchCurrentGesture() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/current_gesture');
        if (!response.ok) throw new Error("Error en red");

        const data = await response.json();

        if (data.gesture !== "Ninguno" && data.gesture !== gestureDisplay.innerText) {
            gestureDisplay.innerText = data.gesture;

            gestureDisplay.style.transform = "scale(1.05)";
            setTimeout(() => {
                gestureDisplay.style.transform = "scale(1)";
            }, 200);
        } else if (data.gesture === "Ninguno") {
            gestureDisplay.innerText = "Detectando...";
        }

        connectionStatus.innerText = "Conectado";
        connectionStatus.style.color = "#10b981";

    } catch (error) {
        console.error("Error obteniendo gesto:", error);
        connectionStatus.innerText = "Desconectado";
        connectionStatus.style.color = "#ef4444";
    }
}

setInterval(fetchCurrentGesture, 500);

async function setMode(mode) {
    try {
        await fetch('http://127.0.0.1:5000/api/set_mode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mode: mode })
        });
    } catch (error) {
        console.error("Error configurando el modo:", error);
    }
}
