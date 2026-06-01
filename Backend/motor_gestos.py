from detector_abecedario import detect_letter
from detector_numeros import detect_number
from detector_palabras import detect_word

class GestureEngine:
    """
    Motor de Gestos: Encargado de derivar la lógica de detección 
    según el modo seleccionado (letras, números o palabras).
    Esta clase puede ser mantenida por un desarrollador independiente.
    """
    def __init__(self):
        self.TIP_IDS = [4, 8, 12, 16, 20]
        
    def extract_fingers(self, lm_list):
        fingers = []
        if not lm_list:
            return fingers
            
        # Pulgar
        fingers.append(1 if lm_list[self.TIP_IDS[0]][1] > lm_list[self.TIP_IDS[0] - 1][1] else 0)
        
        # Otros 4 dedos
        for i in range(1, 5):
            fingers.append(1 if lm_list[self.TIP_IDS[i]][2] < lm_list[self.TIP_IDS[i] - 2][2] else 0)
            
        return fingers

    def recognize(self, lm_list, mode):
        if not lm_list:
            return "Ninguno"
            
        fingers = self.extract_fingers(lm_list)
        
        if mode == 'letters':
            return detect_letter(lm_list, fingers)
        elif mode == 'numbers':
            return detect_number(lm_list, fingers)
        elif mode == 'words':
            return detect_word(lm_list, fingers)
            
        return "Modo desconocido"
