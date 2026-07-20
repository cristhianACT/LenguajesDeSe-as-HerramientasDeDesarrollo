from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from detector_senas import SignDetector

app = Flask(__name__)
CORS(app)

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
import mysql.connector
from datetime import datetime

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
}

def get_db():
    conn = mysql.connector.connect(**DB_CONFIG)
    try:
        conn.database = 'senas'
    except mysql.connector.Error:
        pass
    return conn

def init_db():
    conn = mysql.connector.connect(host=DB_CONFIG['host'], user=DB_CONFIG['user'], password=DB_CONFIG['password'])
    c = conn.cursor()
    c.execute("CREATE DATABASE IF NOT EXISTS senas")
    conn.database = 'senas'
    c.execute('''
        CREATE TABLE IF NOT EXISTS incidencias (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255),
            correo VARCHAR(255),
            tipo VARCHAR(255),
            descripcion TEXT,
            fecha VARCHAR(50),
            estado VARCHAR(50)
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            correo VARCHAR(255) UNIQUE,
            password VARCHAR(255),
            rol VARCHAR(50)
        )
    ''')
    c.execute("SELECT * FROM usuarios WHERE correo='admin@admin.com'")
    if not c.fetchone():
        c.execute("INSERT INTO usuarios (correo, password, rol) VALUES ('admin@admin.com', 'admin', 'admin')")
        c.execute("INSERT INTO usuarios (correo, password, rol) VALUES ('user@user.com', 'user', 'user')")
    conn.commit()
    c.close()
    conn.close()

try:
    init_db()
except Exception as e:
    print("Error conectando a MySQL (¿Está encendido el servidor MySQL?):", e)

total_sessions = 1

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    correo = data.get('correo')
    password = data.get('password')
    conn = get_db()
    c = conn.cursor(dictionary=True)
    c.execute("SELECT * FROM usuarios WHERE correo=%s AND password=%s", (correo, password))
    user = c.fetchone()
    c.close()
    conn.close()
    
    if user:
        return jsonify({"status": "success", "rol": user['rol'], "correo": user['correo']})
    return jsonify({"status": "error", "message": "Credenciales inválidas"}), 401

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    correo = data.get('correo')
    password = data.get('password')
    rol = 'user'
    
    conn = get_db()
    c = conn.cursor()
    try:
        c.execute("INSERT INTO usuarios (correo, password, rol) VALUES (%s, %s, %s)", (correo, password, rol))
        conn.commit()
        c.close()
        conn.close()
        return jsonify({"status": "success", "message": "Usuario registrado exitosamente"})
    except mysql.connector.IntegrityError:
        c.close()
        conn.close()
        return jsonify({"status": "error", "message": "El correo ya está en uso"}), 400

@app.route('/api/stats')
def get_stats():
    conn = get_db()
    c = conn.cursor(dictionary=True)
    c.execute("SELECT * FROM incidencias")
    incidencias = c.fetchall()
    c.close()
    conn.close()
    
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
    conn = get_db()
    c = conn.cursor(dictionary=True)
    if request.method == 'POST':
        data = request.get_json()
        nombre = data.get('nombre', 'Anónimo')
        correo = data.get('correo', '')
        tipo = data.get('tipo', 'Otro')
        descripcion = data.get('descripcion', '')
        fecha = datetime.now().strftime("%Y-%m-%d")
        estado = "Pendiente"
        
        c.execute("INSERT INTO incidencias (nombre, correo, tipo, descripcion, fecha, estado) VALUES (%s, %s, %s, %s, %s, %s)",
                  (nombre, correo, tipo, descripcion, fecha, estado))
        conn.commit()
        new_id = c.lastrowid
        c.close()
        conn.close()
        
        return jsonify({"status": "success", "incidencia": {"id": new_id, "nombre": nombre, "correo": correo, "tipo": tipo, "descripcion": descripcion, "fecha": fecha, "estado": estado}})
        
    c.execute("SELECT * FROM incidencias")
    incidencias = c.fetchall()
    c.close()
    conn.close()
    return jsonify(incidencias)

@app.route('/api/incidencias/<int:inc_id>', methods=['PUT'])
def update_incidencia(inc_id):
    data = request.get_json()
    nuevo_estado = data.get('estado')
    conn = get_db()
    c = conn.cursor()
    c.execute("UPDATE incidencias SET estado=%s WHERE id=%s", (nuevo_estado, inc_id))
    conn.commit()
    c.close()
    conn.close()
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True, port=5000, threaded=True)