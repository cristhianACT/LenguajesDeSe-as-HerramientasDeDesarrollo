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

if __name__ == '__main__':
    app.run(debug=True, port=5000, threaded=True)
