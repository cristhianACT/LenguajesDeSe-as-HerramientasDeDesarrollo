import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from motor_gestos import GestureEngine

class SignDetector:
    def __init__(self):
        # 1. Configuración del detector de manos de MediaPipe
        base_options = python.BaseOptions(model_asset_path='detector/hand_landmarker.task')
        options = vision.HandLandmarkerOptions(
            base_options=base_options,
            num_hands=1,
            min_hand_detection_confidence=0.7,
            min_tracking_confidence=0.5,
            running_mode=vision.RunningMode.IMAGE
        )
        self.detector = vision.HandLandmarker.create_from_options(options)
        
        # Constantes para dibujar y calcular posiciones
        self.HAND_CONNECTIONS = [
            (0,1),(1,2),(2,3),(3,4),(0,5),(5,6),(6,7),(7,8),
            (5,9),(9,10),(10,11),(11,12),(9,13),(13,14),(14,15),(15,16),
            (13,17),(17,18),(18,19),(19,20),(0,17)
        ]
        
        # 2. Inicialización de la cámara y del Motor de Gestos
        self.cap = cv2.VideoCapture(0)
        self.current_gesture = "Ninguno"
        self.mode = "words" # Modos: 'words', 'numbers', 'letters'
        
        # Delegamos la lógica de detección de gestos al Engine
        self.gesture_engine = GestureEngine()

    def set_mode(self, mode):
        self.mode = mode

    def process_frame(self):
        """Captura un frame, dibuja los puntos y actualiza el gesto detectado."""
        success, img = self.cap.read()
        if not success:
            return None

        # Efecto espejo para que sea intuitivo
        img = cv2.flip(img, 1)
        h, w, _ = img.shape

        # Procesar con MediaPipe
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
        results = self.detector.detect(mp_image)

        lm_list = []
        if results.hand_landmarks:
            hand = results.hand_landmarks[0]
            
            # Dibujar puntos
            for lm in hand:
                cx, cy = int(lm.x * w), int(lm.y * h)
                cv2.circle(img, (cx, cy), 5, (255, 0, 255), cv2.FILLED)
                
            # Dibujar lineas de conexión
            for s, e in self.HAND_CONNECTIONS:
                x1, y1 = int(hand[s].x * w), int(hand[s].y * h)
                x2, y2 = int(hand[e].x * w), int(hand[e].y * h)
                cv2.line(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
                
            # Guardar lista de puntos para el reconocedor
            for i, lm in enumerate(hand):
                lm_list.append([i, int(lm.x * w), int(lm.y * h)])

        # Actualizar el gesto global usando el Motor de Gestos
        self.current_gesture = self.gesture_engine.recognize(lm_list, self.mode)
        
        cv2.putText(img, f'Gesto: {self.current_gesture}', (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
        
        return img

    def generate_video(self):
        """Generador continuo de frames para enviarlos al Frontend."""
        while True:
            frame = self.process_frame()
            if frame is None:
                break
            # Codificar a jpg
            _, buffer = cv2.imencode('.jpg', frame)
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
