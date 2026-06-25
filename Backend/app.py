from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from detector_senas import SignDetector

app = Flask(__name__)
CORS(app)

# Instanciamos la clase que maneja toda la lógica visual
detector = SignDetector()

@app.route('/')
def index():
    return jsonify({"message": "SignApp API funcionando"})

@app.route('/api/video_feed')
def video_feed():
    """Ruta para enviar el video en tiempo real al frontend."""
    return Response(detector.generate_video(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/current_gesture')
def get_gesture():
    """Ruta para consultar el último gesto detectado."""
    return jsonify({"gesture": detector.current_gesture})

@app.route('/api/set_mode', methods=['POST'])
def set_mode():
    """Ruta para cambiar el modo de detección (letras, números, palabras)."""
    data = request.get_json()
    mode = data.get('mode', 'words')
    detector.set_mode(mode)
    return jsonify({"status": "success", "mode": mode})

import os
import json
from datetime import datetime

# Archivo de incidencias
INCIDENCIAS_FILE = 'incidencias.json'

def load_incidencias():
    if not os.path.exists(INCIDENCIAS_FILE):
        return []
    try:
        with open(INCIDENCIAS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return []

def save_incidencias(data):
    with open(INCIDENCIAS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)

total_sessions = 1

@app.route('/api/stats')
def get_stats():
    incidencias = load_incidencias()
    pendientes = len([i for i in incidencias if i['estado'] == 'Pendiente'])
    solucionadas = len([i for i in incidencias if i['estado'] == 'Solucionado'])
    ultima_incidencia = incidencias[-1] if incidencias else None
    
    return jsonify({
        "total_incidencias": len(incidencias),
        "pendientes": pendientes,
        "solucionadas": solucionadas,
        "ultima_incidencia": ultima_incidencia,
        "total_detections": detector.total_detections,
        "last_detected_gesture": detector.last_detected_gesture,
        "last_detection_time": detector.last_detection_time,
        "total_sessions": total_sessions
    })

@app.route('/api/incidencias', methods=['GET', 'POST'])
def manage_incidencias():
    incidencias = load_incidencias()
    if request.method == 'POST':
        data = request.get_json()
        new_id = 1 if not incidencias else max(i.get('id', 0) for i in incidencias) + 1
        new_incidencia = {
            "id": new_id,
            "nombre": data.get('nombre', 'Anónimo'),
            "correo": data.get('correo', ''),
            "tipo": data.get('tipo', 'Otro'),
            "descripcion": data.get('descripcion', ''),
            "fecha": datetime.now().strftime("%Y-%m-%d"),
            "estado": "Pendiente"
        }
        incidencias.append(new_incidencia)
        save_incidencias(incidencias)
        return jsonify({"status": "success", "incidencia": new_incidencia})
    return jsonify(incidencias)

@app.route('/api/incidencias/<int:inc_id>', methods=['PUT'])
def update_incidencia(inc_id):
    incidencias = load_incidencias()
    data = request.get_json()
    for inc in incidencias:
        if inc['id'] == inc_id:
            inc['estado'] = data.get('estado', inc['estado'])
            save_incidencias(incidencias)
            return jsonify({"status": "success", "incidencia": inc})
    return jsonify({"status": "error", "message": "No encontrada"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000, threaded=True)