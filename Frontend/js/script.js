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

const fetchStats = async () => {
    try {
        const res = await fetch('http://127.0.0.1:5000/api/stats');
        if (!res.ok) return;
        const stats = await res.json();

        // Update stats
        const statDetections = el('stat-detections');
        if (statDetections) statDetections.innerText = stats.total_detections;

        const statLastTime = el('stat-last-time');
        if (statLastTime) statLastTime.innerText = stats.last_detection_time ? stats.last_detection_time : "Nunca";

        const statSolved = el('stat-solved');
        if (statSolved) statSolved.innerText = stats.solucionadas;

        const statPending = el('stat-pending');
        if (statPending) statPending.innerText = `${stats.pendientes} pendientes`;

        const statSessions = el('stat-sessions');
        if (statSessions) statSessions.innerText = stats.total_sessions;

    } catch (e) {
        console.log("Error fetching stats");
    }
};

const fetchRecentIncidencias = async () => {
    try {
        const res = await fetch('http://127.0.0.1:5000/api/incidencias');
        if (!res.ok) return;
        const incidencias = await res.json();

        const list = el('recent-incidencias');
        if (!list) return;

        if (incidencias.length === 0) {
            list.innerHTML = `<li class="text-sm text-gray-500 italic">No hay incidencias</li>`;
            return;
        }

        const recent = incidencias.slice(-3).reverse();
        list.innerHTML = recent.map(inc => `
            <li class="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                <div class="flex flex-col">
                    <span class="text-sm font-semibold text-gray-700">${inc.tipo}</span>
                    <span class="text-xs text-gray-400">${inc.fecha}</span>
                </div>
                <span class="text-xs px-2 py-1 rounded-full font-medium ${inc.estado === 'Solucionado' ? 'bg-green-100 text-green-700' :
                inc.estado === 'En revisión' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
            }">${inc.estado}</span>
            </li>
        `).join('');

    } catch (e) {
        console.log("Error fetching incidencias");
    }
};

// Polling for stats and recent incidences
if (el('stat-detections')) {
    setInterval(fetchStats, 2000);
    setInterval(fetchRecentIncidencias, 5000);
    fetchStats();
    fetchRecentIncidencias();
}